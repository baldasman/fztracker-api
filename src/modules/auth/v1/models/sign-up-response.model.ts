import { CreatedSuccessResponseModel } from '../../../core/models/created-success-response.model';

export class SignUpResponseDataModel {
  activationToken: string;
  confirmationCode: string;
}

export class SignUpResponseModel extends CreatedSuccessResponseModel {
  data: SignUpResponseDataModel;
}
