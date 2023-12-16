import { HISTORY_SUCCESS } from "../../constants/ActionTypes";

/**
 * Load menu
 *
 * @export
 * @returns
 */
export function setHistory(data) {
  return { type: HISTORY_SUCCESS, data };
}
