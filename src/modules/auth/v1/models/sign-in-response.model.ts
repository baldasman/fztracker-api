import { CreatedSuccessResponseModel } from '../../../core/models/created-success-response.model';

export class SignInResponseDataModel {
  token: string;
}

export class SignInResponseModel extends CreatedSuccessResponseModel {
  data: SignInResponseDataModel;
}
