import { Constants } from '../../../config/constants';

export const getResponse = (status, options?: { resultMessage?: any, data?: {}, service?: any, traceId?: any }) => {
  const response = {
    resultCode: status || 200,
    resultMessage: options && options.resultMessage ? options.resultMessage : '',
    resultTimestamp: Math.round(+new Date() / 1000),
    data: options && options.data ? options.data : {},
    service: status !== 200 ? (options && options.service ? options.service : Constants.SERVICE_KEY) : undefined,
    traceId: options && options.traceId ? options.traceId : undefined
  };

  if (status) {
    if (response.resultMessage === '') {
      switch (status) {
        case 200:
          response.resultMessage = 'OK';
          break;
        case 400:
          response.resultMessage = 'Make sure you are sending the right parameters and in the right format!';
          break;
        case 401:
          response.resultMessage = 'Unauthorized';
          break;
        case 403:
          response.resultMessage = 'Forbidden';
          break;
        case 404:
          response.resultMessage = 'Resource not found!';
          break;
        case 409:
          response.resultMessage = 'There are conflicts in request data that do not allow it\'s execution';
          break;
        case 500:
          response.resultMessage = 'Internal server error!';
          break;
        case 503:
          response.resultMessage = 'Service Unavailable';
          break;
        default:
          break;
      }
    }
  }

  return response;
};
