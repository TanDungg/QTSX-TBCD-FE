import { Modal as AntModal, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { FormSubmit } from "src/components/Common";
const FormItem = Form.Item;

function ModalCauTrucKhoVatTu({ openModalFS, openModal, refesh, info, type }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  useEffect(() => {
    if (openModal) {
      if (type === "keEdit" || type === "tangEdit" || type === "nganEdit") {
        setFieldsValue({
          cauTrucKho: info,
        });
      }
    }
  }, [openModal]);

  const saveData = (cauTrucKho) => {
    if (type === "khoNew" || type === "keNew" || type === "tangNew") {
      const url = "tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu";
      const newData = {
        ...cauTrucKho,
        tits_qtsx_CauTrucKho_Id: info.id,
      };

      new Promise((resolve, reject) => {
        dispatch(fetchStart(url, "POST", newData, "ADD", "", resolve, reject));
      })
        .then((res) => {
          if (res && res.status !== 409) {
            openModalFS(false);
            resetFields();
            refesh();
          }
        })
        .catch((error) => console.error(error));
    } else if (
      type === "keEdit" ||
      type === "tangEdit" ||
      type === "nganEdit"
    ) {
      const url = "tits_qtsx_CauTrucKho";
      const newData = {
        id: info.id,
        ...cauTrucKho,
        tits_qtsx_CauTrucKho_Id: info.tits_qtsx_CauTrucKho_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `${url}/${info.id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            openModalFS(false);
            resetFields();
            refesh();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  const onFinish = (values) => {
    saveData(values.cauTrucKho);
  };
  const title =
    type === "khoNew"
      ? "Thêm kệ"
      : type === "keEdit"
      ? "Chỉnh sửa kệ"
      : type === "keNew"
      ? "Thêm tầng"
      : type === "tangEdit"
      ? "Chỉnh sửa tầng"
      : type === "tangNew"
      ? "Thêm ngăn"
      : type === "nganEdit" && "Chỉnh sửa ngăn";

  return (
    <AntModal
      title={title}
      open={openModal}
      width={`60%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label={
              type === "khoNew" || type === "keEdit"
                ? "Mã kệ"
                : type === "keNew" || type === "tangEdit"
                ? "Mã tầng"
                : (type === "tangNew" || type === "nganEdit") && "Mã ngăn"
            }
            name={["cauTrucKho", "maCauTrucKho"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              placeholder={
                type === "khoNew" || type === "kenEdit"
                  ? "Mã kệ"
                  : type === "keNew" || type === "tangEdit"
                  ? "Mã tầng"
                  : (type === "tangNew" || type === "nganEdit") && "Mã ngăn"
              }
            ></Input>
          </FormItem>
          <FormItem
            label={
              type === "khoNew" || type === "keEdit"
                ? "Tên kệ"
                : type === "keNew" || type === "tangEdit"
                ? "Tên tầng"
                : (type === "tangNew" || type === "nganEdit") && "Tên ngăn"
            }
            name={["cauTrucKho", "tenCauTrucKho"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              placeholder={
                type === "khoNew" || type === "keEdit"
                  ? "Tên kệ"
                  : type === "keNew" || type === "tangEdit"
                  ? "Tên tầng"
                  : (type === "tangNew" || type === "nganEdit") && "Tên ngăn"
              }
            ></Input>
          </FormItem>
          <FormItem
            label="Vị trí"
            name={["cauTrucKho", "viTri"]}
            rules={[
              { required: true },
              {
                pattern: /^[1-9]\d*$/,
                message: "Vị trí không hợp lệ!",
              },
            ]}
          >
            <Input type="number" placeholder="Vị trí"></Input>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalCauTrucKhoVatTu;
