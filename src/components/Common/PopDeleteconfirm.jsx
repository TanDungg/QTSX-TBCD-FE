import { Popconfirm } from "antd";
import React from "react";

/**
 * Xóa item
 *
 * @param {*} deleteAction Hàm xóa item
 * @param {*} id item
 * @returns
 */
function PopDeleteconfirm(deleteAction, name, title, button, disabled) {
  return (
    <Popconfirm
      title={`Xóa ${title}`}
      description={`Bạn sẽ xoá ${title} ${name}. 
    Nhấn Đồng ý để xác nhận.`}
      onConfirm={() => deleteAction()}
      // onCancel={cancel}
      okText="Đồng ý"
      disabled={disabled}
      cancelText="Hủy"
    >
      {button}
    </Popconfirm>
  );
}

export default PopDeleteconfirm;
