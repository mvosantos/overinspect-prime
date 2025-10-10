import BaseService from './BaseService';

class SamplingTypeService extends BaseService {
  constructor() {
    super('/inspection/sampling-type');
  }
}

export default new SamplingTypeService();
