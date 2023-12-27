import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Col,
  Card,
  Tag,
} from "antd";
import { isEmpty, map } from "lodash";
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
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [ListKhoThanhPham, setListKhoThanhPham] = useState([]);
  const [DataListThanhPham, setDataListThanhPham] = useState([]);
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ListDonHang, setListDonHang] = useState([]);
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [SelectedViTri, setSelectedViTri] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListKho();
      getListViTriThanhPham(itemData.tits_qtsx_CauTrucKho_Id);
      getListDonHang();
      setFieldsValue({
        themthanhpham: {
          tits_qtsx_CauTrucKho_Id: itemData.tits_qtsx_CauTrucKho_Id,
        },
      });
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&&isThanhPham=true`,
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
          setListKhoThanhPham(res.data);
        } else {
          setListKhoThanhPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListViTriThanhPham = (
    tits_qtsx_CauTrucKho_Id,
    tits_qtsx_ThanhPham_Id,
    tits_qtsx_MauSac_Id
  ) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_CauTrucKho_Id,
      tits_qtsx_ThanhPham_Id,
      tits_qtsx_MauSac_Id,
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
            const thanhpham = `${data.tenSanPham}${
              data.mauSac ? data.mauSac : ""
            }`;
            return {
              ...data,
              thanhPham: thanhpham,
            };
          });
          const newData = newListThanhPham.filter((data) => {
            if (itemData.ListThanhPham.length > 0) {
              return !itemData.ListThanhPham.some(
                (item) =>
                  item.tits_qtsx_ThanhPham_Id.toLowerCase() ===
                    data.tits_qtsx_ThanhPham_Id.toLowerCase() &&
                  (!item.tits_qtsx_MauSac_Id ||
                    item.tits_qtsx_MauSac_Id.toLowerCase()) ===
                    (!data.tits_qtsx_MauSac_Id ||
                      data.tits_qtsx_MauSac_Id.toLowerCase())
              );
            } else {
              return true;
            }
          });
          setListThanhPham(newData);
        } else {
          const newData = res.data.map((data) => {
            const vitri = `${data.maKe ? `${data.maKe}` : ""}${
              data.maTang ? ` - ${data.maTang}` : ""
            }${data.maNgan ? ` - ${data.maNgan}` : ""}`;
            return {
              ...data,
              viTri: vitri ? vitri : null,
              soLuong: data.soLuongTonKho,
            };
          });
          setListViTriKho(newData);
        }
      }
    });
  };

  const handleInputChange = (val, item) => {
    const soLuongXuat = val.target.value;
    if (isEmpty(soLuongXuat) || Number(soLuongXuat) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongXuat > item.soLuongTonKho) {
      setFieldTouch(false);
      item.message = `Số lượng xuất không được lớn hơn ${item.soLuongTonKho}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_ChiTietKhoVatTu_Id !== item.tits_qtsx_ChiTietKhoVatTu_Id
        );
      if (newData.length !== 0) {
        setFieldTouch(false);
      } else if (SelectedViTri.length === 0) {
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListViTriKho];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongXuat;
      }
    });
    setListViTriKho(newData);

    const newSelect = [...SelectedViTri];
    newSelect.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongXuat;
      }
    });
    setSelectedViTri(newSelect);
  };

  const renderSoLuongXuat = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (
          ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
        ) {
          isEditing = true;
          message = ct.message;
        }
      });

    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
            borderColor: isEditing ? "red" : "",
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  let colListViTri = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Tên kho",
      dataIndex: "tenKho",
      key: "tenKho",
      align: "center",
    },
    {
      title: "Tên kệ",
      dataIndex: "tenKe",
      key: "tenKe",
      align: "center",
    },
    {
      title: "Tên tầng",
      dataIndex: "tenTang",
      key: "tenTang",
      align: "center",
    },
    {
      title: "Tên ngăn",
      dataIndex: "tenNgan",
      key: "tenNgan",
      align: "center",
    },
    {
      title: "Số lượng tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "Số lượng xuất",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongXuat(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
  ];

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

  const deleteItemFunc = (item) => {
    const title = "thành phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

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

  const renderLstViTri = (record) => {
    return (
      <div>
        {record.list_ChiTietLuuKhos.map((vt, index) => {
          if (!vt.viTri) {
            if (index === 0) {
              return (
                <Tag
                  key={index}
                  color={"blue"}
                  style={{
                    marginRight: 5,
                    marginBottom: 3,
                    fontSize: 14,
                  }}
                >
                  {`${vt.tenKho} (SL: ${vt.soLuong})`}
                </Tag>
              );
            } else {
              return null;
            }
          } else {
            return (
              <Tag
                key={index}
                color={"blue"}
                style={{
                  marginRight: 5,
                  marginBottom: 3,
                  fontSize: 14,
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {`${vt.viTri} (SL: ${vt.soLuong})`}
              </Tag>
            );
          }
        })}
        <EditOutlined
          style={{
            color: "#0469B9",
          }}
          onClick={() => {
            // HandleChonViTri(record, true);
          }}
        />
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
      title: "Mã thành phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "tên thành phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Số lượng xuất",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
    },
    {
      title: "Vị trí",
      key: "list_ChiTietLuuKhos",
      align: "center",
      render: (record) => renderLstViTri(record),
    },
    {
      title: "Đơn hàng",
      dataIndex: "maPhieu",
      key: "maPhieu",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
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
    const data = values.themthanhpham;
    const thanhpham = ListThanhPham.filter(
      (d) => d.tits_qtsx_ThanhPham_Id === data.tits_qtsx_ThanhPham_Id
    );

    const tong =
      SelectedViTri &&
      SelectedViTri.reduce(
        (tong, vitri) => tong + Number(vitri.soLuong || 0),
        0
      );

    const donhang =
      data.tits_qtsx_DonHang_Id &&
      ListDonHang.filter(
        (d) => d.id.toLowerCase() === data.tits_qtsx_DonHang_Id.toLowerCase()
      );

    const newData = {
      ...data,
      ...thanhpham[0],
      soLuong: tong,
      maDonHang: donhang && donhang[0].maPhieu,
      list_ChiTietLuuKhos: SelectedViTri,
    };

    setDataListThanhPham([...DataListThanhPham, newData]);

    const listthanhpham = ListThanhPham.filter(
      (d) => d.tits_qtsx_ThanhPham_Id !== data.tits_qtsx_ThanhPham_Id
    );
    setListThanhPham(listthanhpham);
    resetFields();
    setFieldTouch(false);
    setListViTriKho([]);
    setFieldsValue({
      themthanhpham: {
        tits_qtsx_CauTrucKho_Id: itemData.tits_qtsx_CauTrucKho_Id,
      },
    });
  };

  const XacNhan = () => {
    DataThemThanhPham(DataListThanhPham);
    openModalFS(false);
    setListThanhPham([]);
    setListDonHang([]);
    setDataListThanhPham([]);
  };

  const handleSelectViTri = (value) => {
    const thanhpham = ListThanhPham.filter(
      (vt) => vt.tits_qtsx_ThanhPham_Id === value
    );
    getListViTriThanhPham(
      itemData.tits_qtsx_CauTrucKho_Id,
      value,
      thanhpham.length ? thanhpham[0].tits_qtsx_MauSac_Id : null
    );
    setSelectedViTri([]);
    setSelectedKeys([]);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedViTri,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedViTri = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      if (newSelectedViTri.length === 0) {
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
      }
      setSelectedViTri(newSelectedViTri);
      setSelectedKeys(newSelectedKeys);
    },
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
                  label="Kho"
                  name={["themthanhpham", "tits_qtsx_CauTrucKho_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListKhoThanhPham}
                    placeholder="Chọn kho thành phẩm"
                    optionsvalue={["id", "tenCauTrucKho"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled
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
                  label="Thành phẩm"
                  name={["themthanhpham", "tits_qtsx_ThanhPham_Id"]}
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
                    optionsvalue={["tits_qtsx_ThanhPham_Id", "thanhPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={handleSelectViTri}
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
                  label="Đơn hàng"
                  name={["themthanhpham", "tits_qtsx_DonHang_Id"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonHang}
                    placeholder="Chọn đơn hàng"
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
                  label="Ghi chú"
                  name={["themthanhpham", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input className="input-item" placeholder="Nhập ghi chú" />
                </FormItem>
              </Col>
            </Row>
            <Table
              bordered
              columns={colListViTri}
              scroll={{ x: 1000, y: "45vh" }}
              className="gx-table-responsive"
              dataSource={reDataForTable(ListViTriKho)}
              size="small"
              pagination={false}
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
                preserveSelectedRowKeys: true,
                selectedRowKeys: SelectedKeys,
              }}
            />
            <Row justify={"center"} style={{ marginTop: 15 }}>
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
