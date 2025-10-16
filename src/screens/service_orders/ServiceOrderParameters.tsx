import { useEffect, useRef, useState } from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import type { InputSwitchChangeEvent } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';
import serviceTypeService from '../../services/serviceTypeService';

type FieldState = {
    id: string;
    label: string;
    hint?: string | null;
    name?: string;
    service_type_field_id?: string;
    visible: boolean;
    required: boolean;
    in_operation: boolean;
    required_operation: boolean;
    readonly: boolean;
    in_report: boolean;
    default_value: string | null;
};

export default function ServiceOrderParameters() {
    const { t } = useTranslation(['common', 'service_orders']);
    const toast = useRef<Toast | null>(null);

    const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | null>(null);
    const [serviceTypeOptions, setServiceTypeOptions] = useState<Array<{ id: string; name: string }>>([]);
    const [fields, setFields] = useState<FieldState[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch service type when id changes
    useEffect(() => {
        if (!selectedServiceTypeId) {
            setFields([]);
            return;
        }

        setLoading(true);
        serviceTypeService.getByServiceTypeId(selectedServiceTypeId)
            .then((res) => {
                type ServiceTypeResponse = { service_type_fields?: unknown[] } & Record<string, unknown>;
                const st = Array.isArray(res) ? (res as ServiceTypeResponse[])[0] : (res as ServiceTypeResponse);
                const stObj = st as ServiceTypeResponse | undefined;
                const rawFields = (stObj?.service_type_fields as unknown[]) || [];
                const f = rawFields.map((fieldRaw) => {
                    const field = fieldRaw as Record<string, unknown>;
                    return {
                        id: String(field.id),
                        label: String(field.label ?? ''),
                        hint: field.hint as string | null | undefined,
                        name: field.name as string | undefined,
                        service_type_field_id: String(field.id),
                        visible: (field.visible as boolean) ?? true,
                        required: (field.required as boolean) ?? false,
                        in_operation: (field.in_operation as boolean) ?? false,
                        required_operation: (field.required_operation as boolean) ?? false,
                        readonly: (field.readonly as boolean) ?? false,
                        in_report: (field.in_report as boolean) ?? false,
                        default_value: (field.default_value as string) ?? '',
                    } as FieldState;
                });
                setFields(f);
            })
            .catch(() => toast.current?.show({ severity: 'error', summary: t('common:fetch_error') }))
            .finally(() => setLoading(false));
    }, [selectedServiceTypeId, t]);

    // fetch all service types for dropdown
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const list = await serviceTypeService.listAll();
                if (!mounted) return;
                const opts = (list || []).map((s: unknown) => {
                    const rec = s as Record<string, unknown>;
                    return { id: String(rec.id ?? ''), name: String(rec.name ?? rec.title ?? '') };
                }).filter((o: { id: string }) => !!o.id);
                setServiceTypeOptions(opts as { id: string; name: string }[]);
            } catch {
                // ignore errors silently for now
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleFieldChange = (index: number, key: keyof FieldState, value: unknown) => {
        setFields((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };

            if (key === 'visible' && value === false) {
                updated[index] = {
                    ...updated[index],
                    required: false,
                    in_operation: false,
                    readonly: false,
                    in_report: false,
                    required_operation: false,
                };
            }

            if (key === 'in_operation' && value === false) {
                updated[index] = {
                    ...updated[index],
                    readonly: false,
                    required_operation: !updated[index].readonly,
                };
            }

            if (key === 'readonly' && value) {
                updated[index] = {
                    ...updated[index],
                    required_operation: !updated[index].readonly,
                };
            }

            return updated;
        });
    };

    const handleSave = async () => {
        if (!selectedServiceTypeId) return;
        setSaving(true);
        try {
            // The backend method to update fields isn't implemented here; we'll call update on the service path if available
            // Try to call update if available on the service; fallback to direct put if not.
            // Use the dedicated updateFields which PUTs to /inspection/service-type-field/{service_type_id}
            await (serviceTypeService as unknown as { updateFields: (id: string, f: unknown) => Promise<unknown> }).updateFields(selectedServiceTypeId, fields);
            toast.current?.show({ severity: 'success', summary: t('common:record_saved_successfully') });
        } catch {
            toast.current?.show({ severity: 'error', summary: t('common:fetch_error') });
        } finally {
            setSaving(false);
        }
    };

    const labelBody = (row: FieldState) => (
        <div>
            <div style={{ fontWeight: 600 }}>{row.label}</div>
            {row.hint && <div style={{ fontSize: 12, color: '#666' }}>{row.hint}</div>}
        </div>
    );

    const switchBody = (key: keyof FieldState, disabled?: (row: FieldState) => boolean) => (row: FieldState) => {
        const index = fields.findIndex(f => f.id === row.id);
    const raw = row[key];
    const checked = typeof raw === 'boolean' ? raw : !!raw;
        return (
            <InputSwitch
                checked={!!checked}
                onChange={(e: InputSwitchChangeEvent) => handleFieldChange(index, key, e.value ?? false)}
                disabled={disabled ? disabled(row) : false}
            />
        );
    };

    return (
        <div>
            <Toast ref={toast} position="top-right" />
            <div className="card">
                <div className="mb-3">
                    <BreadCrumb model={[{ label: t('service_orders:service_orders') }, { label: t('service_orders:settings') }]} />
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl">{t('service_orders:settings_title')}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <Dropdown
                            value={selectedServiceTypeId}
                            options={serviceTypeOptions.map(o => ({ label: o.name, value: o.id }))}
                            onChange={(e) => setSelectedServiceTypeId(e.value ?? null)}
                            placeholder={String(t('service_orders:service_type_required'))}
                            className="min-w-[20rem]" // ou w-[320px]
                            appendTo="self"
                            loading={loading}
                            filter
                            showClear
                        />
                        <Button
                            label={t('service_orders:save_parameters')}
                            icon="pi pi-save"
                            onClick={handleSave}
                            disabled={!selectedServiceTypeId || saving}
                            loading={loading || saving}
                        />
                    </div>

                </div>

                <DataTable value={fields} loading={loading} emptyMessage={t('common:no_records_found')}
                    responsiveLayout="scroll">
                    <Column header={t('service_orders:field')} body={labelBody} style={{ minWidth: '300px' }} />
                    <Column header={t('service_orders:visible')} body={switchBody('visible')} style={{ width: '7rem' }} alignHeader='center'  bodyStyle={{ textAlign: 'center' }} />
                    <Column header={t('service_orders:required')} body={switchBody('required', (r) => !r.visible)} style={{ width: '7rem' }} alignHeader='center' bodyStyle={{ textAlign: 'center' }} />
                    <Column header={t('service_orders:show_in_operation')} body={switchBody('in_operation', (r) => !r.visible)} style={{ width: '7rem' }} alignHeader='center' bodyStyle={{ textAlign: 'center' }} />
                    <Column header={t('service_orders:read_only_in_operation')} body={switchBody('readonly', (r) => !r.visible && !r.in_operation)} style={{ width: '7rem' }} alignHeader='center' bodyStyle={{ textAlign: 'center' }} />
                    <Column header={t('service_orders:required_in_operation')} body={switchBody('required_operation', (r) => r.visible && r.readonly)} style={{ width: '7rem' }} alignHeader='center' bodyStyle={{ textAlign: 'center' }} />
                    <Column header={t('service_orders:show_in_report')} body={switchBody('in_report', (r) => !r.visible)} style={{ width: '7rem' }} alignHeader='center' bodyStyle={{ textAlign: 'center' }} />
                    <Column header={t('service_orders:default_field_value')} body={(row) => {
                        const idx = fields.findIndex(f => f.id === row.id);
                        return (
                            <InputText value={row.default_value ?? ''} onChange={(e) => handleFieldChange(idx, 'default_value', (e.target as HTMLInputElement).value)} />
                        );
                    }} style={{ minWidth: '220px' }} />
                </DataTable>
            </div>
        </div>
    );
}
