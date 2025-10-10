import BaseService from './BaseService';

class UserService extends BaseService {
  constructor() {
    super('/user');
  }
}

export default new UserService();
