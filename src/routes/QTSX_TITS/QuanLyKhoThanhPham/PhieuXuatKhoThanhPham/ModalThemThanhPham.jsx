import { DeleteOutlined } from "@ant-design/icons";
import { Modal as AntModal, Form, Input, Row, Button, Col, Card } from "antd";
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
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalThemThanhPham({
  openModalFS,
  openModal,
  DataThemThanhPham,
  itemData,
}) {
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
  const [DataListThanhPham, setDataListThanhPham] = useState([]);
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ListDonHang, setListDonHang] = useState([]);

  useEffect(() => {
    if (openModal) {
      console.log(itemData);
      // getListThanhPham();
      // getListDonHang();
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

  const getListViTriThanhPham = (
    tits_qtsx_CauTrucKho_Id,
    tits_qtsx_ThanhPham_Id
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_ThanhPham_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoThanhPham/thanh-pham-by-kho?${param}`,
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
        if (!tits_qtsx_ThanhPham_Id) {
          const newListThanhPham = res.data.map((data) => {
            return {
              ...data,
              thanhPham: `${data.maSanPham} - ${data.tenSanPham}`,
            };
          });

          const newData = newListThanhPham.filter((data) => {
            if (itemData.ListThanhPham.length > 0) {
              return !itemData.some(
                (item) =>
                  item.tits_qtsx_ThanhPham_Id.toLowerCase() ===
                  data.tits_qtsx_ThanhPham_Id.toLowerCase()
              );
            } else {
              return true;
            }
          });
          setListThanhPham(newData);
        } else {
          const newListViTriThanhPham = res.data.map((data) => {
            return {
              ...data,
              thanhPham: `${data.maSanPham} - ${data.tenSanPham}`,
            };
          });

          const newData = newListViTriThanhPham.filter((data) => {
            if (itemData.ListThanhPham.length > 0) {
              return !itemData.some(
                (item) =>
                  item.tits_qtsx_ThanhPham_Id.toLowerCase() ===
                  data.tits_qtsx_ThanhPham_Id.toLowerCase()
              );
            } else {
              return true;
            }
          });
          setListThanhPham(newData);
        }
      } else {
        setListThanhPham([]);
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
    const newData = DataListThanhPham.filter(
      (d) => d.tits_qtsx_ThanhPham_Id !== item.tits_qtsx_ThanhPham_Id
    );
    setDataListThanhPham(newData);

    const vattu = DataListThanhPham.filter(
      (d) => d.tits_qtsx_ThanhPham_Id === item.tits_qtsx_ThanhPham_Id
    );
    setListThanhPham([...ListThanhPham, vattu[0]]);
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
      title: "tên thành phẩm",
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
    const ListThanhPham = ListThanhPham.filter(
      (d) => d.id === data.tits_qtsx_ThanhPham_Id
    );
    const donhang = ListDonHang.filter(
      (d) => d.id === data.tits_qtsx_DonHang_Id
    );
    const DataList = {
      ...data,
      ...ListThanhPham[0],
      tenDonHang: donhang[0].tenDonHang,
      maPhieu: donhang[0].maPhieu,
      thanhTien: data.donGia
        ? parseFloat(data.soLuong * data.donGia)
        : parseFloat(data.soLuong),
      ngay: data.ngay.format("DD/MM/YYYY"),
    };
    setDataListThanhPham([...DataListThanhPham, DataList]);

    const VatTu = ListThanhPham.filter(
      (d) => d.id !== data.tits_qtsx_ThanhPham_Id
    );
    setListThanhPham(VatTu);
    resetFields();
    setFieldTouch(false);
    setFieldsValue({
      themvattu: {
        ngay: moment(getDateNow(), "DD/MM/YYYY"),
      },
    });
  };

  const XacNhan = () => {
    DataThemThanhPham(DataListThanhPham);
    openModalFS(false);
    setListThanhPham([]);
    setDataListThanhPham([]);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm danh sách thành phẩm"
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
                  label="Thành phẩm"
                  name={["themvattu", "tits_qtsx_ThanhPham_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListThanhPham}
                    placeholder="Chọn tên thành phẩm"
                    optionsvalue={["id", "thanhPham"]}
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
            </Row>
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm thành phẩm
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
          dataSource={reDataForTable(DataListThanhPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />

        <Row justify={"center"} style={{ marginTop: 15 }}>
          <Button
            type="primary"
            onClick={XacNhan}
            disabled={DataListThanhPham.length === 0}
          >
            Xác nhận
          </Button>
        </Row>
      </Card>
    </AntModal>
  );
}

export default ModalThemThanhPham;
