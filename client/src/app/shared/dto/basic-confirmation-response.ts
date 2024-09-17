/**
 * Interface representing the structure of the basic confirmation response sent from the server.
 *
 * This interface is used to standardize the JSON object that is returned whenever
 * any `2XX` HTTP status code is triggered (e.g., `200 OK`, `201 Created`, etc.).
 *
 * The object can be consumed by the frontend to notify the user about successful actions
 * (e.g., via a toast service or success notification system).
 *
 */
export interface BasicConfirmationResponse {
  message: string;
}
