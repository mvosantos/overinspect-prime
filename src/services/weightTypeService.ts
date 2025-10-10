import BaseService from './BaseService';

class WeightTypeService extends BaseService {
  constructor() {
    super('/inspection/weight-type');
  }
}

export default new WeightTypeService();
