import { Modal as AntModal, Form, Input, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
import moment from "moment";
import dayjs from "dayjs";
const FormItem = Form.Item;

function AddSanPham({
  openModalFS,
  openModal,
  refesh,
  info,
  type,
  addSanPham,
}) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListLoaiSanPham, setListLoaiSanPham] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListMauSac, setListMauSac] = useState([]);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  useEffect(() => {
    if (openModal) {
      getLoaiSanPham();
      getMauSac();
      if (type === "edit") {
        getSanPham(info.tits_qtsx_LoaiSanPham_Id);
        setFieldsValue({
          chitiet: {
            ...info,
            ngay: moment(info.ngay, "DD/MM/YYYY"),
          },
        });
      } else {
        resetFields();
      }
    }
  }, [openModal]);
  const getLoaiSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_LoaiSanPham?page=-1`,
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
          setListLoaiSanPham(res.data);
        } else {
          setListLoaiSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getSanPham = (loaiSanPham_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?tits_qtsx_LoaiSanPham_Id=${loaiSanPham_Id}&&page=-1`,
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
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getMauSac = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_MauSac?page=-1`,
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
          setListMauSac(res.data);
        } else {
          setListMauSac([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const saveData = (chitiet) => {
    const newData = chitiet;
    newData.ngay = chitiet.ngay && chitiet.ngay._i;
    newData.tits_qtsx_ChiTiet =
      newData.tits_qtsx_SanPham_Id + "_" + newData.tits_qtsx_MauSac_Id;

    ListSanPham.forEach((sp) => {
      if (sp.id === newData.tits_qtsx_SanPham_Id) {
        newData.tenSanPham = sp.tenSanPham;
        newData.maSanPham = sp.maSanPham;
        newData.tenLoaiSanPham = sp.tenLoaiSanPham;
      }
    });
    ListMauSac.forEach((ms) => {
      if (ms.id === newData.tits_qtsx_MauSac_Id) {
        newData.tenMauSac = ms.tenMauSac;
      }
    });
    addSanPham(newData, type);
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
  const title = type === "new" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm";

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

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
            label="Loại sản phẩm"
            name={["chitiet", "tits_qtsx_LoaiSanPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiSanPham}
              placeholder="Chọn loại sản phẩm"
              optionsvalue={["id", "tenLoaiSanPham"]}
              style={{ width: "100%" }}
              showSearch
              onSelect={(val) => getSanPham(val)}
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Sản phẩm"
            name={["chitiet", "tits_qtsx_SanPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham}
              placeholder="Chọn sản phẩm"
              optionsvalue={["id", "tenSanPham"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={(val) => {
                ListSanPham.forEach((sp) => {
                  if (sp.id === val) {
                    setFieldsValue({
                      chitiet: {
                        tenDonViTinh: sp.tenDonViTinh,
                      },
                    });
                  }
                });
              }}
            />
          </FormItem>
          <FormItem
            label="Lốp"
            name={["chitiet", "lop"]}
            rules={[{ type: "string", required: true }]}
          >
            <Input placeholder="Lốp"></Input>
          </FormItem>
          <FormItem
            label="Màu sắc"
            name={["chitiet", "tits_qtsx_MauSac_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListMauSac}
              placeholder="Chọn màu sắc"
              optionsvalue={["id", "tenMauSac"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Đơn vị tính"
            name={["chitiet", "tenDonViTinh"]}
            rules={[{ type: "string", required: true }]}
          >
            <Input placeholder="Đơn vị tính" disabled={true}></Input>
          </FormItem>

          <FormItem
            label="Số lượng"
            name={["chitiet", "soLuong"]}
            rules={[
              { required: true },
              {
                pattern: /^[1-9]\d*$/,
                message: "Số lượng không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Số lượng" type="number"></Input>
          </FormItem>
          <FormItem
            label="Đơn giá"
            name={["chitiet", "donGia"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Đơn giá không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Đơn giá" type="number"></Input>
          </FormItem>
          <FormItem
            label="Vận chuyển"
            name={["chitiet", "phiVanChuyen"]}
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[1-9]\d*$/,
                message: "Chi phí vận chuyểng không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Chi phí vận chuyển" type="number"></Input>
          </FormItem>
          <FormItem label="Ngày bàn giao" name={["chitiet", "ngay"]}>
            <DatePicker
              format={"DD/MM/YYYY"}
              allowClear={false}
              onChange={(date, dateString) => {
                setFieldsValue({
                  chitiet: {
                    ngay: moment(dateString, "DD/MM/YYYY"),
                  },
                });
              }}
              disabledDate={disabledDate}
            />
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

export default AddSanPham;
