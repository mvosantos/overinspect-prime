import BaseService from './BaseService';

class MeasureService extends BaseService {
  constructor() {
    super('/inspection/measure');
  }
}

export default new MeasureService();
