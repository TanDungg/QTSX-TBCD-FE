import { Modal as AntModal, Button, Row, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { Select } from "src/components/Common";
import Helpers from "src/helpers";

const FormItem = Form.Item;

function ModalAddVatTuSanPham({ openModalFS, openModal, refesh, hanldeThem }) {
  const dispatch = useDispatch();
  const [ListXuong, setListXuong] = useState([]);
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListSanPham, setListSanPham] = useState([]);

  useEffect(() => {
    if (openModal) {
      getXuong();
    }
  }, [openModal]);
  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
        const xuong = [];
        res.data.forEach((x) => {
          if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
            xuong.push(x);
          }
        });
        setListXuong(xuong);
      } else {
        setListXuong([]);
      }
    });
  };
  const getSanPham = (phongBan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-san-pham-bom-theo-phong-ban?PhongBan_Id=${phongBan_Id}`,
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
        const newData = res.data.map((ct) => {
          return {
            ...ct,
            name: ct.maSanPham + " - " + ct.tenSanPham,
          };
        });
        setListSanPham(newData);
      } else {
        setListSanPham([]);
      }
    });
  };

  const saveData = (vattu) => {
    const params = convertObjectToUrlParams({
      SanPham_Id: vattu.sanPham_Id,
      phongBan_Id: vattu.phongBan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/bom-vat-tu-by-san-pham?${params}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data.length !== 0) {
          const data = res.data[0];
          const newData =
            data.chiTietBOM &&
            JSON.parse(data.chiTietBOM).map((ct) => {
              return {
                ...ct,
                sanPham_Id: data.sanPham_Id,
                tenSanPham: data.tenSanPham,
                bom_Id: data.id,
                lkn_ChiTietBOM_Id: ct.lkn_ChiTietBOM_Id.toLowerCase(),
                vatTu_Id: ct.vatTu_Id.toLowerCase(),
                soLuongTheoDinhMuc: Number(
                  (ct.dinhMuc * vattu.soLuong + ct.dinhMucXaNhua).toFixed(6)
                ),
                soLuongKeHoach: Number(
                  (ct.dinhMuc * vattu.soLuong + ct.dinhMucXaNhua).toFixed(6)
                ),
                ghiChu: "",
                hangMucSuDung: "",
                soLuong: Number(
                  (ct.dinhMuc * vattu.soLuong + ct.dinhMucXaNhua).toFixed(6)
                ),
              };
            });
          if (newData) {
            hanldeThem(newData);
            resetFields();
          } else {
            Helpers.alertWarning("Không tìm thấy BOM của sản phẩm");
          }
        } else {
          Helpers.alertWarning("Không tìm thấy BOM của sản phẩm");
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
    saveData(values.vatTu);
  };

  return (
    <AntModal
      title="Thêm vật tư theo sản phẩm"
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
            label="Xưởng"
            name={["vatTu", "phongBan_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong}
              optionsvalue={["id", "tenPhongBan"]}
              placeholder="Chọn xưởng"
              style={{ width: "100%" }}
              onSelect={(val) => getSanPham(val)}
            />
          </FormItem>
          <FormItem
            label="Sản phẩm"
            name={["vatTu", "sanPham_Id"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListSanPham ? ListSanPham : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["sanPham_Id", "name"]}
              style={{ width: "100%" }}
              //   onSelect={(val) => getSanPham(val)}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Số lượng"
            name={["vatTu", "soLuong"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input
              //   style={{
              //     width: "100%",
              //     borderColor: Message ? "red" : "",
              //   }}
              //   className={`input-item ${Message ? "input-error" : ""}`}
              placeholder="Nhập số lượng"
              type="number"
              //   onChange={(e) => hanldeSoLuong(e.target.value)}
              // disabled={type === "new" || type === "edit" ? false : true}
              //   value={SoLuong}
            />
            {/* {Message && <div style={{ color: "red" }}>{Message}</div>} */}
          </FormItem>
          <Row justify={"center"}>
            <Button
              className="th-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              Thêm
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalAddVatTuSanPham;
