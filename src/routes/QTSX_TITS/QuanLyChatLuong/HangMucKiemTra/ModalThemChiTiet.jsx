import { Modal as AntModal, Card, Input, Row, Col, Form, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { FormSubmit, Select } from "src/components/Common";
import { DEFAULT_FORM_XUATKHONGOAIQUAN } from "src/constants/Config";

const FormItem = Form.Item;

function ModalThemChiTiet({ openModalFS, openModal, itemData }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListHangMucSuDung, setListHangMucSuDung] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListXuong, setListXuong] = useState([]);
  const [ListTram, setListTram] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListHangMucSuDung();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListHangMucSuDung = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra?page=-1`,
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
          setListHangMucSuDung(res.data);
        } else {
          setListHangMucSuDung([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onFinish = (value) => {};

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Thêm mới chi tiết hạng mục kiểm tra - ${
        itemData && itemData.tenHangMucKiemTra
      }`}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Form
            {...DEFAULT_FORM_XUATKHONGOAIQUAN}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Row>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Hạng mục kiểm tra cha"
                  name={["themchitiet", "tits_qtsx_HangMucKiemTra_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListHangMucSuDung ? ListHangMucSuDung : []}
                    optionsvalue={[
                      "tits_qtsx_HangMucKiemTra_Id",
                      "tenHangMucKiemTra",
                    ]}
                    style={{ width: "100%" }}
                    placeholder="Chọn hạng mục sử dụng cha"
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Mã số"
                  name={["themchitiet", "maSo"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập mã số" />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Nội dung kiểm tra"
                  name={["themchitiet", "noiDungKiemTra"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập nội dung kiểm tra"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Tiêu chuẩn đánh giá"
                  name={["themchitiet", "tieuChuanDanhGia"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập tiêu chuẩn đánh giá"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Giá trị tiêu chuẩn MIN"
                  name={["themchitiet", "giaTriMin"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input-item"
                    placeholder="Nhập giá trị tiêu chuẩn MIN"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Giá trị tiêu chuẩn MAX"
                  name={["themchitiet", "giaTriMax"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input-item"
                    placeholder="Nhập giá trị tiêu chuẩn MAX"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Nhà máy"
                  name={["themchitiet", "donVi_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonVi ? ListDonVi : []}
                    optionsvalue={["id", "tenDonVi"]}
                    style={{ width: "100%" }}
                    placeholder="Chọn đơn vị nhà máy"
                    showSearch
                    optionFilterProp={"name"}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Xưởng"
                  name={["themchitiet", "tits_qtsx_Xuong_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListXuong ? ListXuong : []}
                    placeholder="Chọn xưởng"
                    optionsvalue={["id", "tenXuong"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    // onSelect={SelectViTriKho}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Trạm"
                  name={["themchitiet", "tits_qtsx_Tram_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListTram ? ListTram : []}
                    placeholder="Chọn trạm"
                    optionsvalue={["id", "tenTram"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    // onSelect={SelectViTriKho}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Nhập kết quả"
                  name={["themchitiet", "isNhapKetQua"]}
                >
                  <Switch defaultChecked />
                </FormItem>
              </Col>
            </Row>
            <FormSubmit goBack={handleCancel} disabled={fieldTouch} />
          </Form>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalThemChiTiet;
