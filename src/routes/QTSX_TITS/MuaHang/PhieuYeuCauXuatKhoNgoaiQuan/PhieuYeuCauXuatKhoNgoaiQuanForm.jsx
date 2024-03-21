import {
  DeleteOutlined,
  PlusCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Card, Form, Input, Row, Col, Button, Tag } from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonVatTu from "./ModalChonVatTu";
import ImportVatTu from "./ImportVatTu";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuYeuCauXuatKhoNgoaiQuanForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListKhachHang, setListKhachHang] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(false);
  const [ActiveImport, setActiveImport] = useState(false);

  const [info, setInfo] = useState({});

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getListDonVi();
          getListKhachHang();
          getUserKy();
          setFieldsValue({
            xuatkhongoaiquan: {
              donViYeuCau_Id: INFO.donVi_Id.toLowerCase(),
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
          getListDonVi();
          getListKhachHang();
          getUserKy();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id, true);
          getListDonVi();
          getListKhachHang();
          getUserKy();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getListDonVi();
          getListKhachHang();
          getUserKy();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`DonVi?page=-1`, "GET", null, "DETAIL", "", resolve, reject)
      );
    }).then((res) => {
      if (res && res.data) {
        setListDonVi(res.data);
      } else {
        setListDonVi([]);
      }
    });
  };

  const getListKhachHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_KhachHang?page=-1`,
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
        setListKhachHang(res.data);
      } else {
        setListKhachHang([]);
      }
    });
  };

  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
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
        const newData = res.data.map((dt) => {
          return {
            ...dt,
            nguoiDuyet: `${dt.maNhanVien} - ${dt.fullName}`,
          };
        });
        setListUserKy(newData);
      } else {
        setListUserKy([]);
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
          `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan/${id}`,
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
          const newData = res.data;
          setInfo(newData);

          const vattu =
            newData.chiTiet_PhieuYeuCaus &&
            JSON.parse(newData.chiTiet_PhieuYeuCaus);
          setListVatTu(vattu);

          setFieldsValue({
            xuatkhongoaiquan: {
              ...newData,
              ngayGiaoDuKien:
                newData.tinhTrang === "Chưa xác nhận"
                  ? moment(getDateNow(), "DD/MM/YYYY")
                  : moment(newData.ngayGiaoDuKien, "DD/MM/YYYY"),
            },
          });
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
          : type === "detail" || type === "UploadFile"
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
    const newData = ListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    if (newData.length !== 0) {
      setFieldTouch(true);
    }
    setListVatTu(newData);
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

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
    },
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
    saveData(values.xuatkhongoaiquan);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.xuatkhongoaiquan, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (xuatkhongoaiquan, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...xuatkhongoaiquan,
        chiTiet_PhieuYeuCaus: ListVatTu.map((dt) => {
          return {
            ...dt,
            soLuong: dt.soLuong && parseFloat(dt.soLuong),
            soLuongKien: dt.soLuongKien && parseFloat(dt.soLuongKien),
            nhapKhau: dt.nhapKhau && parseFloat(dt.nhapKhau),
            vat: dt.vat && parseFloat(dt.vat),
            tong: dt.tong && parseFloat(dt.tong),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan`,
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
              setListVatTu([]);
              setFieldsValue({
                xuatkhongoaiquan: {
                  donViYeuCau_Id: INFO.donVi_Id.toLowerCase(),
                },
              });
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        id: id,
        ...xuatkhongoaiquan,
        chiTiet_PhieuYeuCaus: ListVatTu.map((dt) => {
          return {
            ...dt,
            dinhMuc: parseFloat(dt.dinhMuc),
            soLuongDuPhong: parseFloat(dt.soLuongDuPhong),
            soLuongDatMua: parseFloat(dt.soLuongDatMua),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuYeuCauXuatKhoNgoaiQuan/${id}`,
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
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const DataThemVatTu = (data) => {
    setListVatTu([...ListVatTu, ...data]);
    setFieldTouch(true);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu yêu cầu xuất kho ngoại quan"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu yêu cầu xuất kho ngoại quan"
    ) : (
      <span>
        Chi tiết phiếu yêu cầu xuất kho ngoại quan -{" "}
        <Tag color={"blue"} style={{ fontSize: 15 }}>
          {info && info.maPhieu}
        </Tag>
        {/* <Tag
          color={
            info && info.tinhTrangPhieu === "Chưa nhận"
              ? "orange"
              : info && info.tinhTrangPhieu === "Đã nhận"
              ? "blue"
              : "red"
          }
          style={{ fontSize: 15 }}
        >
          {info && info.tinhTrangPhieu}
        </Tag> */}
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu yêu cầu"}
      >
        <Form
          {...DEFAULT_FORM_TWO_COL}
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
                label="Đơn vị yêu cầu"
                name={["xuatkhongoaiquan", "donViYeuCau_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListDonVi}
                  placeholder="Chọn đơn vị yêu cầu"
                  optionsvalue={["id", "tenDonVi"]}
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
                label="Đơn vị nhận yêu cầu"
                name={["xuatkhongoaiquan", "donViNhanYeuCau_Id"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhachHang}
                  placeholder="Đơn vị nhận yêu cầu"
                  optionsvalue={["id", "tenKhachHang"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Người nhận 1"
                name={["xuatkhongoaiquan", "nguoiNhan1"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập số người nhận 1"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Người nhận 2"
                name={["xuatkhongoaiquan", "nguoiNhan2"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập số người nhận 2"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Người kiểm tra"
                name={["xuatkhongoaiquan", "nguoiKiemTra_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người kiểm tra"
                  optionsvalue={["user_Id", "nguoiDuyet"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Kế toán duyệt"
                name={["xuatkhongoaiquan", "nguoiKeToan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn kế toán duyệt"
                  optionsvalue={["user_Id", "nguoiDuyet"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
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
                label="Duyệt"
                name={["xuatkhongoaiquan", "nguoiDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy}
                  placeholder="Chọn người duyệt"
                  optionsvalue={["user_Id", "nguoiDuyet"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin vật tư"}
      >
        {(type === "new" || type === "edit") && (
          <div align={"end"}>
            <Button
              className="th-margin-bottom-0"
              icon={<UploadOutlined />}
              onClick={() => setActiveImport(true)}
              type="primary"
            >
              Import
            </Button>
            <Button
              className="th-margin-bottom-0"
              icon={<PlusCircleOutlined />}
              onClick={() => setActiveModalChonVatTu(true)}
              type="primary"
            >
              Thêm vật tư
            </Button>
          </div>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1740, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
      </Card>

      {type === "new" || type === "edit" ? (
        <FormSubmit
          goBack={goBack}
          handleSave={saveAndClose}
          saveAndClose={saveAndClose}
          disabled={fieldTouch && ListVatTu.length !== 0}
        />
      ) : null}
      <ModalChonVatTu
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        itemData={ListVatTu && ListVatTu}
        DataThemVatTu={DataThemVatTu}
      />
      <ImportVatTu
        openModal={ActiveImport}
        openModalFS={setActiveImport}
        addVatTu={DataThemVatTu}
        listVatTu={ListVatTu}
      />
    </div>
  );
};

export default PhieuYeuCauXuatKhoNgoaiQuanForm;
