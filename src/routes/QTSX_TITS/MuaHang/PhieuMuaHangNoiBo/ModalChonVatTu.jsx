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
import { DEFAULT_FORM_THEMVATTU } from "src/constants/Config";
import {
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalChonVatTu({ openModalFS, openModal, DataThemVatTu, itemData }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [DataListVatTu, setDataListVatTu] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListDonHang, setListDonHang] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListVatTu();
      getListDonHang();
      setFieldsValue({
        themvattu: {
          ngay: moment(getDateNow(), "DD/MM/YYYY"),
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

  const getListDonHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_DonHang?page=-1`,
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
        const newData = res.data.filter((d) => d.isXacNhan === true);
        setListDonHang(newData);
      } else {
        setListDonHang([]);
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
      width: 45,
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Loại vật tư",
      dataIndex: "tenLoaiVatTu",
      key: "tenLoaiVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Ngày yêu cầu giao",
      dataIndex: "ngay",
      key: "ngay",
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "donGia",
      key: "donGia",
      align: "center",
    },
    {
      title: "Thành tiền",
      dataIndex: "thanhTien",
      key: "thanhTien",
      align: "center",
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
    const listvattu = ListVatTu.filter((d) => d.id === data.tits_qtsx_VatTu_Id);
    const donhang = ListDonHang.filter(
      (d) => d.id === data.tits_qtsx_DonHang_Id
    );
    const DataList = {
      ...data,
      ...listvattu[0],
      tenDonHang: donhang[0].tenDonHang,
      maPhieu: donhang[0].maPhieu,
      thanhTien: parseFloat(data.soLuong * data.donGia),
      ngay: data.ngay.format("DD/MM/YYYY"),
    };
    setDataListVatTu([...DataListVatTu, DataList]);

    const VatTu = ListVatTu.filter((d) => d.id !== data.tits_qtsx_VatTu_Id);
    setListVatTu(VatTu);
    resetFields();
    setFieldTouch(false);
    setFieldsValue({
      themvattu: {
        ngay: moment(getDateNow(), "DD/MM/YYYY"),
      },
    });
  };

  const XacNhan = () => {
    DataThemVatTu(DataListVatTu);
    openModalFS(false);
    setListVatTu([]);
    setDataListVatTu([]);
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
            {...DEFAULT_FORM_THEMVATTU}
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
                  label="Loại vật tư"
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
                    placeholder="Chọn tên loại vật tư"
                    optionsvalue={["id", "tenLoaiVatTu"]}
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
                  label="Đơn đặt hàng"
                  name={["themvattu", "tits_qtsx_DonHang_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonHang}
                    placeholder="Chọn đơn đặt hàng"
                    optionsvalue={["id", "maPhieu"]}
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
                  label="Ngày yêu cầu giao"
                  name={["themvattu", "ngay"]}
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
                <FormItem label="Đơn giá" name={["themvattu", "donGia"]}>
                  <Input
                    className="input-item"
                    placeholder="Nhập đơn giá"
                    type="number"
                    min={0}
                    step="0.01"
                  />
                </FormItem>
              </Col>
            </Row>
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
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

export default ModalChonVatTu;
