import BaseService from './BaseService';

class WeighingRuleService extends BaseService {
  constructor() {
    super('/inspection/weighing-rule');
  }
}

export default new WeighingRuleService();
