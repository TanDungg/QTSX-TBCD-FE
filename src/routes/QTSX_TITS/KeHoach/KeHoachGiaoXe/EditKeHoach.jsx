import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

function EditKeHoach({ openModalFS, openModal, refesh, data }) {
  const dispatch = useDispatch();
  const [listSanPham, setListSanPham] = useState();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      getSanPham(data);
      resetFields();
      setFieldsValue({
        mauSac: {
          tenSanPham: data.tenSanPham,
        },
      });
    }
  }, [openModal]);
  const getSanPham = (dl) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `SanPham/${dl.sanPham_Id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          JSON.parse(res.data.mauSac).forEach((mau) => {
            dl.mauSac.forEach((ms) => {
              const key = `soLuong${ms.mauSac_Id}`;
              if (ms.mauSac_Id === mau.mauSac_Id) {
                setFieldsValue({
                  mauSac: {
                    [key]: ms.soLuong,
                  },
                });
              }
            });
          });
          setListSanPham(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleSubmit = () => {
    validateFields()
      .then((values) => {
        saveData(values.mauSac);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (mauSac) => {
    const newData = JSON.parse(listSanPham.mauSac).map((ms) => {
      return {
        mauSac_Id: ms.mauSac_Id,
        soLuong: mauSac[`soLuong${ms.mauSac_Id}`],
        nam: data.nam,
        thang: data.thang,
        ngay: data.ngay,
      };
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_KeHoach?keHoach_id=${data.keHoach_Id}`,
          "PUT",
          newData,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          openModalFS(false);
          refesh();
        }
      })
      .catch((error) => console.error(error));
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
    // saveData(values.bophan);
  };
  return (
    <AntModal
      title={`Chỉnh sửa kế hoạch ${data.ngay}/${data.thang}/${data.nam}`}
      open={openModal}
      width={`50%`}
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
            label={"Sản phẩm"}
            name={["mauSac", `tenSanPham`]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input placeholder="Nhập số lượng" disabled={true}></Input>
          </FormItem>
          {listSanPham &&
            JSON.parse(listSanPham.mauSac).map((ms) => {
              return (
                <FormItem
                  label={ms.tenMauSac}
                  name={["mauSac", `soLuong${ms.mauSac_Id}`]}
                  rules={[
                    {
                      required: true,
                    },
                    {
                      pattern: /^\d+$/,
                      message: "Số lượng không hợp lệ!",
                    },
                  ]}
                  initialValue={0}
                >
                  <Input placeholder="Nhập số lượng"></Input>
                </FormItem>
              );
            })}
        </Form>
        <Row justify={"center"}>
          <Button
            className="th-btn-margin-bottom-0"
            style={{ marginTop: 10, marginRight: 15 }}
            type="primary"
            onClick={handleSubmit}
            disabled={!fieldTouch}
          >
            Cập nhật
          </Button>
        </Row>
      </div>
    </AntModal>
  );
}

export default EditKeHoach;
