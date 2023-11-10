import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
const FormItem = Form.Item;

function AddChiTietCongDoan({ openModalFS, openModal, refesh, info, type }) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  useEffect(() => {
    if (openModal) {
      if (type === "congDoanNew") {
        setFieldsValue({
          chitiet: {
            tits_qtsx_CongDoan_Id: info.tenCongDoan,
          },
        });
      } else if (type === "xuongNew") {
        setFieldsValue({
          chitiet: {
            tits_qtsx_Xuong_Id: info.tenXuong,
          },
        });
      } else if (type === "chuyenNew") {
        setFieldsValue({
          chitiet: {
            tits_qtsx_Chuyen_Id: info.tenChuyen,
          },
        });
      } else if (type === "chuyenEdit") {
        setFieldsValue({
          chitiet: {
            ...info,
            tits_qtsx_Xuong_Id: info.tenXuong,
          },
        });
      } else if (type === "xuongEdit") {
        setFieldsValue({
          chitiet: {
            ...info,
            tits_qtsx_CongDoan_Id: info.tenCongDoan,
          },
        });
      } else if (type === "tramEdit") {
        setFieldsValue({
          chitiet: {
            ...info,
            tits_qtsx_Chuyen_Id: info.tenChuyen,
          },
        });
      }
    }
  }, [openModal]);

  const saveData = (chitiet) => {
    if (type === "congDoanNew" || type === "xuongNew" || type === "chuyenNew") {
      const url =
        type === "congDoanNew"
          ? "tits_qtsx_Xuong"
          : type === "xuongNew"
          ? "tits_qtsx_Chuyen"
          : type === "chuyenNew" && "tits_qtsx_Tram";
      const newData =
        type === "congDoanNew"
          ? {
              ...chitiet,
              tits_qtsx_CongDoan_Id: info.id,
            }
          : type === "xuongNew"
          ? {
              ...chitiet,
              tits_qtsx_Xuong_Id: info.id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
            }
          : type === "chuyenNew" && {
              ...chitiet,
              tits_qtsx_Chuyen_Id: info.id,
              tits_qtsx_Xuong_Id: info.tits_qtsx_Xuong_Id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
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
      type === "xuongEdit" ||
      type === "chuyenEdit" ||
      type === "tramEdit"
    ) {
      const url =
        type === "xuongEdit"
          ? "tits_qtsx_Xuong"
          : type === "chuyenEdit"
          ? "tits_qtsx_Chuyen"
          : type === "tramEdit" && "tits_qtsx_Tram";
      const newData =
        type === "xuongEdit"
          ? {
              ...chitiet,
              id: info.id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
            }
          : type === "chuyenEdit"
          ? {
              ...chitiet,
              id: info.id,
              tits_qtsx_Xuong_Id: info.tits_qtsx_Xuong_Id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
            }
          : type === "tramEdit" && {
              ...chitiet,
              id: info.id,
              tits_qtsx_Chuyen_Id: info.tits_qtsx_Chuyen_Id,
              tits_qtsx_Xuong_Id: info.tits_qtsx_Xuong_Id,
              tits_qtsx_CongDoan_Id: info.tits_qtsx_CongDoan_Id,
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
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.chitiet);
  };
  const title =
    type === "congDoanNew"
      ? "Thêm xưởng"
      : type === "xuongEdit"
      ? "Chỉnh sửa xưởng"
      : type === "xuongNew"
      ? "Thêm chuyền"
      : type === "chuyenEdit"
      ? "Chỉnh sửa chuyền"
      : type === "chuyenNew"
      ? "Thêm trạm"
      : type === "tramEdit" && "Chỉnh sửa trạm";

  return (
    <AntModal
      title={title}
      open={openModal}
      width={`80%`}
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
              type === "congDoanNew" || type === "xuongEdit"
                ? "Mã xưởng"
                : type === "xuongNew" || type === "chuyenEdit"
                ? "Mã chuyền"
                : (type === "chuyenNew" || type === "tramEdit") && "Mã trạm"
            }
            name={[
              "chitiet",
              type === "congDoanNew" || type === "xuongEdit"
                ? "maXuong"
                : type === "xuongNew" || type === "chuyenEdit"
                ? "maChuyen"
                : (type === "chuyenNew" || type === "tramEdit") && "maTram",
            ]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              placeholder={
                type === "congDoanNew" || type === "xuongnEdit"
                  ? "Mã xưởng"
                  : type === "xuongNew" || type === "chuyenEdit"
                  ? "Mã chuyền"
                  : (type === "chuyenNew" || type === "tramEdit") && "Mã trạm"
              }
            ></Input>
          </FormItem>
          <FormItem
            label={
              type === "congDoanNew" || type === "xuongEdit"
                ? "Tên xưởng"
                : type === "xuongNew" || type === "chuyenEdit"
                ? "Tên chuyền"
                : (type === "chuyenNew" || type === "tramEdit") && "Tên trạm"
            }
            name={[
              "chitiet",
              type === "congDoanNew" || type === "xuongEdit"
                ? "tenXuong"
                : type === "xuongNew" || type === "chuyenEdit"
                ? "tenChuyen"
                : (type === "chuyenNew" || type === "tramEdit") && "tenTram",
            ]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              placeholder={
                type === "congDoanNew" || type === "xuongEdit"
                  ? "Tên xưởng"
                  : type === "xuongNew" || type === "chuyenEdit"
                  ? "Tên chuyền"
                  : (type === "chuyenNew" || type === "tramEdit") && "Tên trạm"
              }
            ></Input>
          </FormItem>
          <FormItem
            label={
              type === "congDoanNew" || type === "xuongEdit"
                ? "Tên công đoạn"
                : type === "xuongNew" || type === "chuyenEdit"
                ? "Tên xưởng"
                : (type === "chuyenNew" || type === "tramEdit") && "Tên chuyền"
            }
            name={[
              "chitiet",
              type === "congDoanNew" || type === "xuongEdit"
                ? "tits_qtsx_CongDoan_Id"
                : type === "xuongNew" || type === "chuyenEdit"
                ? "tits_qtsx_Xuong_Id"
                : (type === "chuyenNew" || type === "tramEdit") &&
                  "tits_qtsx_Chuyen_Id",
            ]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              placeholder={
                type === "congDoanNew" || type === "xuongEdit"
                  ? "Tên công đoạn"
                  : type === "xuongNew" || type === "chuyenEdit"
                  ? "Tên xưởng"
                  : (type === "chuyenNew" || type === "tramEdit") &&
                    "Tên chuyền"
              }
              disabled={true}
            ></Input>
          </FormItem>
          <FormItem
            label="Thứ tự"
            name={["chitiet", "thuTu"]}
            rules={[
              { required: true },
              {
                pattern: /^[1-9]\d*$/,
                message: "Thứ tự không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Thứ tự"></Input>
          </FormItem>
          <FormItem
            label="Ghi chú"
            name={["chitiet", "moTa"]}
            rules={[
              {
                type: "string",
              },
            ]}
          >
            <Input placeholder="Ghi chú"></Input>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default AddChiTietCongDoan;
