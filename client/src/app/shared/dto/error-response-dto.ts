/**
 * Interface representing the structure of the error response sent from the server.
 *
 * This interface is used to standardize the JSON object that is returned whenever
 * any `4XX` HTTP status code is triggered. This can be used for various client error responses
 * such as `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, etc.
 *
 * The object can be consumed by the frontend (e.g., in a toast service or error notification system)
 * to display error messages to the user.
 *
 * This JSON object will be displayed on the frontend to notify the user about the error.
 */
export interface ErrorResponseDto {
  error: string;
}
