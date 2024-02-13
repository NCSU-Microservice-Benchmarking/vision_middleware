import type { request } from '../../../shared/types/request.d.ts';

export default async function handleSegmentNewRequest(request: request): Promise<boolean | request> {
  try {

    //TODO: Implement this

    return request;
  } catch (error) {
    return Promise.reject(error);
  }

}