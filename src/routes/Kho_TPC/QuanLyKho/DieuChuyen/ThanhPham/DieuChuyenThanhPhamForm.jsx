import {
  CloseCircleOutlined,
  DeleteOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Card, Form, Input, Row, Col, Button, Tag, Divider } from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DIEUCHUYEN_THANHLY } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const DieuChuyenThanhPhamForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [ListKhoVatTuDi, setListKhoVatTuDi] = useState([]);
  const [ListKhoVatTuDen, setListKhoVatTuDen] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else if (includes(match.url, "chinh-sua")) {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.view) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.view) {
          history.push("/home");
        }
      } else if (includes(match.url, "duyet")) {
        if (permission && permission.cof) {
          setType("duyet");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.cof) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getData = () => {
    getUserLap(INFO, null);
    getListKhoDi();
  };

  const getListKhoDi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-thu-tu?thutu=101&isThanhPham=true`,
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
          setListKhoVatTuDi(res.data);
          setListKhoVatTuDen(res.data);
          setListKhoVatTu(res.data);
        } else {
          setListKhoVatTuDi([]);
          setListKhoVatTuDen([]);
          setListKhoVatTu([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListSanPham = (khoDi_Id) => {
    let params = convertObjectToUrlParams({ khoDi_Id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDieuChuyenThanhPham/list-thanh-pham-chua-dieu-chuyen?${params}`,
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
          const newData = res.data.map((data) => {
            return {
              ...data,
              soLuong: data.soLuongTon,
            };
          });
          setListSanPham(newData);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiLap_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}`,
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
        setListUser([res.data]);
        setFieldsValue({
          phieudieuchuyen: {
            nguoiTao_Id: res.data.id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDieuChuyenThanhPham/${id}`,
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
          setInfo(res.data);
          getUserLap(INFO, res.data.nguoiTao_Id, 1);
          getListKhoDi();
          setFieldsValue({
            phieudieuchuyen: {
              ...res.data,
            },
          });

          const newData =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);

          setListSanPham(newData);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new"
          ? "/them-moi"
          : type === "edit"
          ? `/${id}/chinh-sua`
          : type === "detail"
          ? `/${id}/chi-tiet`
          : `/${id}/duyet`,
        ""
      )}`
    );
  };

  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "sản phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter(
      (d) => d.lkn_ChiTietKhoThanhPham_Id !== item.lkn_ChiTietKhoThanhPham_Id
    );
    if (newData.length === 0) {
      setSelectedDevice([]);
      setSelectedKeys([]);
    }
    setListSanPham(newData);
    setFieldTouch(true);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission && permission.del && (type === "new" || type === "edit")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
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

  const handleInputChange = (val, item) => {
    const soLuongDieuChuyen = val.target.value;
    if (isEmpty(soLuongDieuChuyen) || soLuongDieuChuyen === "0") {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongDieuChuyen > item.soLuongTon) {
      setFieldTouch(false);
      item.message = `Số lượng không được lớn hơn ${item.soLuongTon}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData = editingRecord.filter(
        (d) => d.lkn_ChiTietKhoThanhPham_Id !== item.lkn_ChiTietKhoThanhPham_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoThanhPham_Id === item.lkn_ChiTietKhoThanhPham_Id) {
        ct.soLuong = soLuongDieuChuyen;
      }
    });
    setListSanPham(newData);
  };
  const renderSoLuongDieuChuyen = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.lkn_ChiTietKhoThanhPham_Id === item.lkn_ChiTietKhoThanhPham_Id) {
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
          }}
          className={`input-item`}
          type="number"
          value={item.soLuong}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Màu sắc",
      dataIndex: "tenMauSac",
      key: "tenMauSac",
      align: "center",
    },
    {
      title: "Số lượng tồn",
      dataIndex: "soLuongTon",
      key: "soLuongTon",
      align: "center",
    },
    {
      title: "SL điều chuyển",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongDieuChuyen(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
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

  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.phieudieuchuyen);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListSanPham.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieudieuchuyen, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...data,
        list_ChiTiets: ListSanPham.filter(
          (sanpham) => sanpham.soLuong !== 0
        ).map((sanpham) => ({
          ...sanpham,
          soLuong: parseInt(sanpham.soLuong),
        })),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDieuChuyenThanhPham`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListSanPham([]);
              getData();
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...data,
        id: id,
        list_ChiTiets: ListSanPham.filter(
          (sanpham) => sanpham.soLuong !== 0
        ).map((sanpham) => ({
          ...sanpham,
          soLuong: parseInt(sanpham.soLuong),
        })),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDieuChuyenThanhPham/${id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
            setDisabledSave(true);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleSelectKhoDi = (value) => {
    setFieldsValue({
      phieudieuchuyen: {
        khoDen_Id: null,
      },
    });
    const newData = ListKhoVatTu.filter((d) => d.id !== value);
    setListKhoVatTuDen(newData);
    getListSanPham(value);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu điều chuyển thành phẩm "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu điều chuyển thành phẩm"
    ) : type === "detail" ? (
      <span>
        Chi tiết phiếu điều chuyển thành phẩm -{" "}
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
          style={{ fontSize: "14px" }}
        >
          {info.maPhieuDieuChuyenThanhPham}
        </Tag>
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
          style={{ fontSize: "14px" }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    ) : (
      <span>
        Xác nhận phiếu điều chuyển thành phẩm -
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
          style={{ fontSize: "14px" }}
        >
          {info.maPhieuDieuChuyenThanhPham}
        </Tag>
        <Tag
          color={
            info && info.tinhTrang === "Đã duyệt"
              ? "green"
              : info && info.tinhTrang === "Chưa duyệt"
              ? "blue"
              : "red"
          }
          style={{ fontSize: "14px" }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );
  const saveDuyetTuChoi = (isDuyet) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDieuChuyenThanhPham/duyet/${id}`,
          "PUT",
          {
            id: id,
            lyDoTuChoi: !isDuyet ? "Từ chối" : undefined,
          },
          !isDuyet ? "TUCHOI" : "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          goBack();
          getInfo(id);
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };
  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phiếu điều chuyển",
    onOk: () => {
      saveDuyetTuChoi(true);
    },
  };

  const modalDuyet = () => {
    Modal(prop);
  };
  const prop1 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận từ chối phiếu điều chuyển",
    onOk: () => {
      saveDuyetTuChoi(false);
    },
  };
  const modalTuChoi = () => {
    Modal(prop1);
  };
  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedDevice = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedDevice(newSelectedDevice);
      setSelectedKeys(newSelectedKey);
    },
  };
  const hanldleXoaSanPham = () => {
    let newData = [...ListSanPham];
    newData = newData.filter(function (objA) {
      // Kiểm tra xem có đối tượng trong mảng B có cùng lkn_ChiTietKhoThanhPham_Id hay không
      var existsInArrayB = selectedDevice.some(function (objB) {
        return (
          objA.lkn_ChiTietKhoThanhPham_Id === objB.lkn_ChiTietKhoThanhPham_Id
        );
      });

      // Nếu không trùng, giữ lại đối tượng
      return !existsInArrayB;
    });
    setListSanPham(newData);
    setSelectedDevice([]);
    setSelectedKeys([]);
    setFieldTouch(true);
  };
  const prop2 = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận xóa sản phẩm",
    onOk: () => {
      hanldleXoaSanPham();
    },
  };
  const modalXoaSanPham = () => {
    Modal(prop2);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DIEUCHUYEN_THANHLY}
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
                label="Người lập"
                name={["phieudieuchuyen", "nguoiTao_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUser ? ListUser : []}
                  optionsvalue={["id", "fullName"]}
                  style={{ width: "100%" }}
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
                label="Ban/Phòng"
                name={["phieudieuchuyen", "tenPhongBan"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" disabled={true} />
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
                label="Kho đi"
                name={["phieudieuchuyen", "khoDi_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTuDi ? ListKhoVatTuDi : []}
                  optionsvalue={["id", "tenCTKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho điều chuyển"
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKhoDi}
                  disabled={type === "new" ? false : true}
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
                label="Kho đến"
                name={["phieudieuchuyen", "khoDen_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTuDen ? ListKhoVatTuDen : []}
                  optionsvalue={["id", "tenCTKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho nhận"
                  showSearch
                  optionFilterProp={"name"}
                  disabled={type === "new" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Divider style={{ marginBottom: 15 }} />
        <Row justify={"center"}>
          <h2 style={{ color: "#0469B9" }}>
            <strong>DANH SÁCH SẢN PHẨM</strong>
          </h2>
        </Row>
        {(type === "edit" || type === "new") && (
          <Row>
            <Col span={24}>
              <Button
                type="danger"
                disabled={selectedDevice.length === 0}
                onClick={modalXoaSanPham}
              >
                Xóa
              </Button>
            </Col>
          </Row>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 992, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListSanPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          rowSelection={
            (type === "edit" || type === "new") && {
              type: "checkbox",
              ...rowSelection,
              preserveSelectedRowKeys: true,
              selectedRowKeys: selectedKeys,
              getCheckboxProps: (record) => ({}),
            }
          }
        />
        {type === "duyet" && info.tinhTrang === "Chưa duyệt" ? (
          <>
            <Divider />
            <Row style={{ marginTop: 20 }}>
              <Col style={{ marginBottom: 8, textAlign: "center" }} span={24}>
                <Button
                  className="th-margin-bottom-0"
                  icon={<RollbackOutlined />}
                  onClick={goBack}
                  style={{ marginTop: 10 }}
                >
                  Quay lại
                </Button>
                <Button
                  className="th-margin-bottom-0"
                  type="primary"
                  onClick={() => modalDuyet()}
                  icon={<SaveOutlined />}
                  style={{ marginTop: 10 }}
                >
                  Duyệt
                </Button>
                <Button
                  // disabled={!fieldTouch}
                  type="danger"
                  className="th-margin-bottom-0"
                  icon={<CloseCircleOutlined />}
                  style={{ marginTop: 10 }}
                  onClick={() => modalTuChoi()}
                >
                  Từ chối
                </Button>
              </Col>
            </Row>
          </>
        ) : null}
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={onFinish}
            saveAndClose={saveAndClose}
            disabled={
              type === "new"
                ? fieldTouch && ListSanPham.length !== 0
                : fieldTouch || !DisabledSave
            }
          />
        ) : null}
      </Card>
    </div>
  );
};

export default DieuChuyenThanhPhamForm;
