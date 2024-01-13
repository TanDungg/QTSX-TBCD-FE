import { DeleteOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Col,
  Card,
  DatePicker,
} from "antd";
import { map } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { DEFAULT_FORM_XUATKHONGOAIQUAN } from "src/constants/Config";
import Helpers from "src/helpers";
import {
  convertObjectToUrlParams,
  getDateNow,
  reDataForTable,
} from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalTuChoi({ openModalFS, openModal, DataThemVatTu, itemData }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [DataListVatTu, setDataListVatTu] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListPhieuMuaHang, setListPhieuMuaHang] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListVatTu();
      setFieldsValue({
        themvattu: {
          ngayHoanThanh: moment(getDateNow(), "DD/MM/YYYY"),
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_VatTu?page=-1`,
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
          return {
            ...data,
            vatTu: `${data.maVatTu} - ${data.tenVatTu}`,
          };
        });

        const newData = newListVatTu.filter((data) => {
          if (itemData.length > 0) {
            return !itemData.some(
              (item) => item.tits_qtsx_VatTu_Id.toLowerCase() === data.id
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

  const getListPhieuMuaHang = (tits_qtsx_VatTu_Id) => {
    const param = convertObjectToUrlParams({ tits_qtsx_VatTu_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan/list-phieu-mua-hang-ngoai?${param}`,
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
        setListPhieuMuaHang(res.data);
      } else {
        setListPhieuMuaHang([]);
      }
    });
  };

  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = DataListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    setDataListVatTu(newData);

    const vattu = DataListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id
    );
    setListVatTu([...ListVatTu, vattu[0]]);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      width: 130,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      width: 200,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      width: 100,
    },
    {
      title: "Số bill",
      dataIndex: "soBill",
      key: "soBill",
      align: "center",
      width: 100,
    },
    {
      title: "Số lượng kiện",
      dataIndex: "soLuongKien",
      key: "soLuongKien",
      align: "center",
      width: 100,
    },
    {
      title: "Tiền thuế (USD)",
      align: "center",
      children: [
        {
          title: "Nhập khẩu",
          dataIndex: "nhapKhau",
          key: "nhapKhau",
          align: "center",
          width: 100,
        },
        {
          title: "VAT (10%)",
          dataIndex: "vat",
          key: "vat",
          align: "center",
          width: 100,
        },
        {
          title: "Tổng",
          dataIndex: "tong",
          key: "tong",
          align: "center",
          width: 100,
        },
      ],
    },
    {
      title: "Ngày hoàn thành thủ tục",
      dataIndex: "ngayHoanThanh",
      key: "ngayHoanThanh",
      align: "center",
      width: 130,
    },
    {
      title: "Hình thức khai báo",
      dataIndex: "hinhThucKhaiBao",
      key: "hinhThucKhaiBao",
      align: "center",
      width: 150,
    },
    {
      title: "Phiếu mua hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
      width: 150,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const onFinish = (values) => {
    const data = values.themvattu;
    const listvattu = ListVatTu.find((d) => d.id === data.tits_qtsx_VatTu_Id);

    const donhang = ListPhieuMuaHang.find(
      (d) =>
        d.tits_qtsx_PhieuMuaHangNgoai_Id === data.tits_qtsx_PhieuMuaHangNgoai_Id
    );

    if (Number(data.soLuong) > Number(donhang.soLuongChuaNhan)) {
      Helpers.alertError(
        "Số lượng phải nhỏ hơn hoặc bằng số lượng của phiếu mua hàng"
      );
      setFieldTouch(false);
    } else {
      const DataList = {
        ...data,
        ...(listvattu && listvattu),
        maPhieu: donhang && donhang.maPhieu,
        ngayHoanThanh: data.ngayHoanThanh.format("DD/MM/YYYY"),
        tong: data.nhapKhau && parseFloat(data.nhapKhau) + parseFloat(data.vat),
      };
      setDataListVatTu([...DataListVatTu, DataList]);

      const VatTu = ListVatTu.filter((d) => d.id !== data.tits_qtsx_VatTu_Id);
      setListVatTu(VatTu);
      resetFields();
      setFieldTouch(false);
      setFieldsValue({
        themvattu: {
          ngayHoanThanh: moment(getDateNow(), "DD/MM/YYYY"),
        },
      });
    }
  };

  const XacNhan = () => {
    DataThemVatTu(DataListVatTu);
    openModalFS(false);
    setListVatTu([]);
    setDataListVatTu([]);
  };

  const handleSelectVatTu = (value) => {
    getListPhieuMuaHang(value);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm thông tin vật tư"
      open={openModal}
      width={width > 1200 ? `85%` : `90%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
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
                  label="Tên vật tư"
                  name={["themvattu", "tits_qtsx_VatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatTu}
                    placeholder="Chọn tên vật tư"
                    optionsvalue={["id", "vatTu"]}
                    style={{ width: "100%" }}
                    showSearch
                    onSelect={handleSelectVatTu}
                    optionFilterProp="name"
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
                  label="Đơn vị tính"
                  name={["themvattu", "tits_qtsx_VatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatTu}
                    placeholder="Chọn đơn vị tính"
                    optionsvalue={["id", "tenDonViTinh"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={true}
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
                  label="Phiếu mua hàng"
                  name={["themvattu", "tits_qtsx_PhieuMuaHangNgoai_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListPhieuMuaHang}
                    placeholder="Chọn phiếu mua hàng ngoài"
                    optionsvalue={["tits_qtsx_PhieuMuaHangNgoai_Id", "maPhieu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
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
                  label="Số lượng"
                  name={["themvattu", "soLuong"]}
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
                    placeholder="Nhập số lượng"
                    inputMode="numeric"
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
                  label="Số bill"
                  name={["themvattu", "soBill"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập số bill" />
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
                  label="Số lượng kiện"
                  name={["themvattu", "soLuongKien"]}
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
                    placeholder="Nhập số lượng kiện"
                    inputMode="numeric"
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
                <FormItem label="Nhập khẩu" name={["themvattu", "nhapKhau"]}>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input-item"
                    placeholder="Nhập số lượng nhập khẩu"
                    inputMode="numeric"
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
                  label="VAT"
                  name={["themvattu", "vat"]}
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
                    placeholder="Nhập số lượng nhập khẩu"
                    inputMode="numeric"
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
                  label="Hình thức khai báo"
                  name={["themvattu", "hinhThucKhaiBao"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập hình thức khai báo"
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
                  label="Ngày hoàn thành thủ tục"
                  name={["themvattu", "ngayHoanThanh"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker format={"DD/MM/YYYY"} allowClear={false} />
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
                  label="Ghi chú"
                  name={["themvattu", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập số bill" />
                </FormItem>
              </Col>
            </Row>
            <Row justify={"center"}>
              <Button
                className="th-margin-bottom-0"
                type="primary"
                htmlType={"submit"}
                disabled={!fieldTouch}
              >
                Thêm vật tư
              </Button>
            </Row>
          </Form>
        </div>

        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(DataListVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />

        <Row justify={"center"} style={{ marginTop: 15 }}>
          <Button
            className="th-margin-bottom-0"
            type="primary"
            onClick={XacNhan}
            disabled={DataListVatTu.length === 0}
          >
            Xác nhận
          </Button>
        </Row>
      </Card>
    </AntModal>
  );
}

export default ModalTuChoi;
