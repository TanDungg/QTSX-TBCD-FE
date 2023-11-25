import { Modal as AntModal, Form, Input, Button, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import { FormSubmit } from "src/components/Common";
import moment from "moment";
import dayjs from "dayjs";
import { convertObjectToUrlParams } from "src/util/Common";
const FormItem = Form.Item;

function ModalVatTu({
  openModalFS,
  openModal,
  refesh,
  info,
  editSanPham,
  type,
  itemData,
  tits_qtsx_CauTrucKho_Id,
}) {
  const dispatch = useDispatch();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListVatTu, setListVatTu] = useState([]);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  useEffect(() => {
    if (openModal) {
      getVatTu(tits_qtsx_CauTrucKho_Id);
      setFieldsValue({
        chitiet: {
          ...info,
        },
      });
    }
  }, [openModal]);
  const getVatTu = (tits_qtsx_CauTrucKho_Id) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/list-vi-tri-luu-kho-vat-tu?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        const newListVatTu = res.data.map((data) => {
          const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
            data.tenTang ? ` - ${data.tenTang}` : ""
          }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;
          return {
            ...data,
            vatTu: `${data.maVatTu} - ${data.tenVatTu}${
              vitri ? ` (${vitri})` : ""
            }${data.thoiGianSuDung ? ` - ${data.thoiGianSuDung}` : ""}`,
            soLuong: data.soLuong,
            tits_qtsx_ChiTietKhoBegin_Id: data.tits_qtsx_ChiTietKhoVatTu_Id,
            tits_qtsx_VatPham_Id: data.tits_qtsx_VatTu_Id,
          };
        });

        const newData = newListVatTu.filter((data) => {
          if (itemData.ListViTriKho.length > 0) {
            return !itemData.ListViTriKho.some(
              (item) => item.vatTu === data.vatTu
            );
          } else {
            return true;
          }
        });

        setListVatTu(newData);
      } else {
        setListVatTu([]);
      }
    });
  };
  const saveData = (chitiet) => {
    const newData = { ...info, ...chitiet };
    ListQuyTrinh.forEach((qt) => {
      if (
        qt.tits_qtsx_QuyTrinhSanXuat_Id === chitiet.tits_qtsx_QuyTrinhSanXuat_Id
      ) {
        newData.tenQuyTrinhSanXuat = qt.tenQuyTrinhSanXuat;
        newData.maQuyTrinhSanXuat = qt.maQuyTrinhSanXuat;
      }
    });
    editSanPham(newData, type);
    resetFields();
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
  const title = "Thông tin mã sản phẩm nội bộ";
  const props = {
    accept: ".png, .jpge, .jpg",
    showUploadList: false,
    maxCount: 1,
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
            label="Vật tư"
            name={["vatTu", "tits_qtsx_VatPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu}
              placeholder="Chọn vật tư"
              optionsvalue={["tits_qtsx_VatPham_Id", "tenVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Số lượng tồn kho"
            name={["vatTu", "tits_qtsx_VatPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu}
              placeholder="Chọn vật tư"
              optionsvalue={["tits_qtsx_VatPham_Id", "soLuongTonKho"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Số lượng thanh lý"
            name={["vatTu", "tits_qtsx_VatPham_Id"]}
            rules={[{ type: "string", required: true }]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListVatTu}
              placeholder="Chọn vật tư"
              optionsvalue={["tits_qtsx_VatPham_Id", "soLuong"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Đề xuất"
            name={["vatTu", "deXuat"]}
            rules={[{ type: "string" }]}
          >
            <Input placeholder="Nhập đề xuất"></Input>
          </FormItem>
          <FormItem
            label="Nguyên nhân"
            name={["vatTu", "nguyenNhan"]}
            rules={[{ type: "string" }]}
          >
            <Input placeholder="Nhập nguyên nhân"></Input>
          </FormItem>
          <FormItem
            label="Hình ảnh"
            name={["vatTu", "file"]}
            rules={[{ type: "string" }]}
          >
            <Upload
              {...props}
              beforeUpload={(file) => {
                const newData = [...ListVatTu];
                newData.forEach((vt) => {
                  if (
                    vt.tits_qtsx_ChiTietKhoVatTu_Id ===
                    record.tits_qtsx_ChiTietKhoVatTu_Id
                  ) {
                    const reader = new FileReader();
                    reader.onload = (e) => (vt.fileImage = e.target.result);
                    reader.readAsDataURL(file);
                    vt.file = file;
                    vt.hinhAnh = file.name;
                  }
                });
                setListVatTu(newData);

                return false;
              }}
            >
              <Button>Tải file</Button>
            </Upload>
          </FormItem>
          <FormSubmit disabled={fieldTouch} />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalVatTu;
