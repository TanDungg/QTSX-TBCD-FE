import { Modal } from "antd";
import { messages } from "src/constants/Messages";

/**
 * Xóa item
 *
 * @param {*} deleteAction Hàm xóa item
 * @param {*} id item
 * @returns
 */
function ModalDeleteConfirm(deleteAction, item, name, title) {
  Modal.confirm({
    content: `Bạn sẽ xoá ${title} ${name}. 
    Nhấn Đồng ý để xác nhận.`,
    onOk(e) {
      e();
      deleteAction(item);
    },
    okText: messages.MODAL_CONFIRM_OK,
    onCancel() {},
    cancelText: messages.MODAL_CONFIRM_CANCEL,
  });
}

export default ModalDeleteConfirm;
