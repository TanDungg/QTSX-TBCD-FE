import { Modal as AntModal, Button, Row, Form, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import {
  DEFAULT_FORM_CUSTOM,
  LOAI_KE_HOACH_SAN_XUAT,
} from "src/constants/Config";
import { Select } from "src/components/Common";
import moment from "moment";

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

function ModalAddVatTuKHSX({ openModalFS, openModal, refesh, hanldeThem }) {
  const dispatch = useDispatch();
  const [ListXuong, setListXuong] = useState([]);
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, getFieldValue } = form;
  const [firstDate, setFirstDate] = useState(null);
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
  const saveData = (vattu) => {
    const params = convertObjectToUrlParams({
      tuNgay: vattu.tuNgay._i,
      denNgay: vattu.denNgay._i,
      LoaiKeHoach_Id: LOAI_KE_HOACH_SAN_XUAT,
      phongBan_Id: vattu.phongBan_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-bom-vat-tu-theo-ke-hoach?${params}`,
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
          const newData = res.data.list_VatTus.map((ct) => {
            return {
              ...ct,
              vatTu_Id: ct.vatTu_Id,
              lkn_ChiTietBOM_Id: ct.vatTu_Id,
              soLuongTheoDinhMuc: Number(
                (ct.dinhMuc + ct.dinhMucXaNhua).toFixed(6)
              ),
              soLuongKeHoach: Number(
                (ct.dinhMuc + ct.dinhMucXaNhua).toFixed(6)
              ),
              ghiChu: "",
              hangMucSuDung: "",
              soLuong: Number((ct.dinhMuc + ct.dinhMucXaNhua).toFixed(6)),
              soLuongTonKho: ct.soLuongTonKhoVatTu,
            };
          });
          if (newData) {
            hanldeThem(newData);
            setFieldsValue({
              vatTu: {
                phongBan_Id: null,
              },
            });
          }
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
  const validate = (current) => {
    const tuNgay = getFieldValue("vatTu").tuNgay;
    const startOfMonth = moment(tuNgay).startOf("month");
    const endOfMonth = moment(tuNgay).endOf("month");
    return (
      current.isBefore(startOfMonth) || // Ngày trước tháng của ngày bắt đầu
      current.isAfter(endOfMonth) // Ngày sau tháng của ngày bắt đầu
    );
  };
  return (
    <AntModal
      title="Thêm vật tư theo kế hoạch sản xuất"
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
            />
          </FormItem>
          <FormItem
            label="Từ ngày"
            name={["vatTu", "tuNgay"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              format={"DD/MM/YYYY"}
              onChange={(dates, dateString) => {
                setFieldsValue({
                  vatTu: {
                    tuNgay: moment(dateString, "DD/MM/YYYY"),
                    denNgay: null,
                  },
                });
              }}
              defaultValue={moment(getDateNow(), "DD/MM/YYYY")}
              allowClear={false}
            />
          </FormItem>
          <FormItem
            label="Đến ngày"
            name={["vatTu", "denNgay"]}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              format={"DD/MM/YYYY"}
              disabledDate={validate}
              onChange={(dates, dateString) => {
                setFieldsValue({
                  vatTu: {
                    denNgay: moment(dateString, "DD/MM/YYYY"),
                  },
                });
              }}
              defaultValue={moment(getDateNow(), "DD/MM/YYYY")}
              allowClear={false}
            />
          </FormItem>
          <Row justify={"center"}>
            <Button
              className="th-btn-margin-bottom-0"
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

export default ModalAddVatTuKHSX;
