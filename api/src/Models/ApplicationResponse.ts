export default interface ApplicationResponse<T> {
  data: T;
  error: string;
  itemCount: number;
}