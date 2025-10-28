import { Observable } from 'rxjs'

export interface IRabbitMQInterface {
  sendMessage<ResponseType, PayloadType>(
    serviceName: string,
    pattern: string,
    data: PayloadType,
  ): Observable<ResponseType>

  emitMessage<T>(
    serviceName: string,
    pattern: string,
    data: T,
  ): Observable<void>
}
