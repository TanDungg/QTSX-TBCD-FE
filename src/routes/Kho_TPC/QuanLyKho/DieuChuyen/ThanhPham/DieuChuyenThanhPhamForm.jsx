import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Divider,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_DIEUCHUYEN_THANHLY } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  createGuid,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonVatTu from "./ModalChonVatTu";

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
  const [KhoVatTu, setKhoVatTu] = useState(null);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(null);
  const [editingRecord, setEditingRecord] = useState([]);
  const [DisabledSave, setDisabledSave] = useState(true);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            phieudieuchuyen: {
              ngayYeuCau: moment(getDateNow(), "DD/MM/YYYY"),
            },
          });
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
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
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
    getListKhoDen();
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
        } else {
          setListKhoVatTuDi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListKhoDen = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-vat-tu-san-pham`,
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
          setListKhoVatTu(res.data);
          setListKhoVatTuDen(res.data);
        } else {
          setListKhoVatTu([]);
          setListKhoVatTuDen([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getUserLap = (info, nguoiLap_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiLap_Id ? nguoiLap_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiLap_Id ? nguoiLap_Id : info.user_Id}?${params}`,
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
            userLap_Id: res.data.Id,
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
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDieuChuyen/${id}?${params}`,
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
          getUserLap(INFO, res.data.userLap_Id, 1);
          getListKhoDi();
          getListKhoDen();
          setKhoVatTu(res.data.khoDi_Id);
          setFieldsValue({
            phieudieuchuyen: {
              ngayYeuCau: moment(res.data.ngayYeuCau, "DD/MM/YYYY"),
              khoDi_Id: res.data.khoDi_Id,
              khoDen_Id: res.data.khoDen_Id,
            },
          });

          const newData =
            res.data.chiTietVatTu &&
            JSON.parse(res.data.chiTietVatTu).map((data) => {
              const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
                data.tenTang ? ` - ${data.tenTang}` : ""
              }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;

              return {
                ...data,
                lkn_ChiTietKhoBegin_Id: data.lkn_ChiTietKhoBegin_Id
                  ? data.lkn_ChiTietKhoBegin_Id.toLowerCase()
                  : createGuid(),
                vatTu: `${data.maVatTu} - ${data.tenVatTu}${
                  vitri ? ` (${vitri})` : ""
                }`,
              };
            });
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
          : `/${id}/xac-nhan`,
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
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = ListSanPham.filter((d) => d.maVatTu !== item.maVatTu);
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
    } else if (soLuongDieuChuyen > item.soLuong) {
      setFieldTouch(false);
      item.message = `Số lượng không được lớn hơn ${item.soLuong}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData = editingRecord.filter(
        (d) => d.lkn_ChiTietKhoBegin_Id !== item.lkn_ChiTietKhoBegin_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListSanPham];
    newData.forEach((ct, index) => {
      if (ct.lkn_ChiTietKhoBegin_Id === item.lkn_ChiTietKhoBegin_Id) {
        ct.soLuongDieuChuyen = soLuongDieuChuyen;
      }
    });
    setListSanPham(newData);
  };
  const renderSoLuongDieuChuyen = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.lkn_ChiTietKhoBegin_Id === item.lkn_ChiTietKhoBegin_Id) {
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
          value={item.soLuongDieuChuyen}
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
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Vị trí",
      key: "tenKe",
      align: "center",
      render: (val) => (
        <span>
          {val.tenKe &&
            `${val.tenKe}${val.tenTang ? " - " + val.tenTang : ""}${
              val.tenNgan ? " - " + val.tenNgan : ""
            }`}
        </span>
      ),
    },
    {
      title: "SL điều chuyển",
      key: "soLuongDieuChuyen",
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
        ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
        chiTiet_PhieuDieuChuyens: ListSanPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDieuChuyen`,
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
        ngayYeuCau: data.ngayYeuCau.format("DD/MM/YYYY"),
        chiTiet_PhieuDieuChuyens: ListSanPham,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `lkn_PhieuDieuChuyen/${id}`,
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

  const handleChonVatTu = () => {
    setActiveModalChonVatTu(true);
  };

  const handleThemVatTu = (data) => {
    const newListSanPham = [...ListSanPham, ...data];
    setListSanPham(newListSanPham);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const handleSelectKhoDi = (value) => {
    setKhoVatTu(value);
    setFieldsValue({
      phieudieuchuyen: {
        khoDen_Id: null,
      },
    });
    const newData = ListKhoVatTu.filter((d) => d.id !== value);
    setListKhoVatTuDen(newData);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu điều chuyển thành phẩm "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu điều chuyển thành phẩm"
    ) : (
      <span>
        Chi tiết phiếu điều chuyển thành phẩm -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieuDieuChuyen}
        </Tag>
      </span>
    );

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
                name={["phieudieuchuyen", "userLap_Id"]}
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
                  optionsvalue={["Id", "fullName"]}
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
                  disabled={
                    ListSanPham && ListSanPham.length === 0 ? false : true
                  }
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
                label="Ngày điều chuyển"
                name={["phieudieuchuyen", "ngayYeuCau"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={true}
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
        {type !== "detail" ? (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleChonVatTu}
              disabled={KhoVatTu === null ? true : false}
            >
              Chọn sản phẩm
            </Button>
          </Row>
        ) : null}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListSanPham)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
        {type !== "detail" ? (
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
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={{ kho_Id: KhoVatTu, listSanPham: ListSanPham && ListSanPham }}
        ThemVatTu={handleThemVatTu}
      />
    </div>
  );
};

export default DieuChuyenThanhPhamForm;
