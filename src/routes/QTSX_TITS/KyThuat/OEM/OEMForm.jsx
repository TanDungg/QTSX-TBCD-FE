import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Upload,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helper from "src/helpers";
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
import { BASE_URL_API, DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import DanhSachImport from "./DanhSachImport";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const OEMForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [type, setType] = useState("new");
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [listVatTu, setListVatTu] = useState([]);
  const [ListSanPham, setListSanPham] = useState([]);
  const [SanPham, setSanPham] = useState(null);
  const [ListNguoiDuyet, setListNguoiDuyet] = useState([]);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ActiveModal, setActiveModal] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getSanPham();
          getNguoiDuyet(INFO);
          setFieldsValue({
            oem: {
              ngayBanHanh: moment(getDateNow(), "DD/MM/YYYY"),
              ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
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
          getSanPham();
          getNguoiDuyet(INFO);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getSanPham();
          getNguoiDuyet(INFO);
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

  const getSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "tits_qtsx_SanPham?page=-1",
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
        if (res && res.data) {
          setListSanPham(res.data);
        } else {
          setListSanPham([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getNguoiDuyet = (info) => {
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
        setListNguoiDuyet(res.data);
      } else {
        setListNguoiDuyet([]);
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
          `tits_qtsx_OEM/${id}`,
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
          const data = res.data;
          setInfo(data);

          const chiTiet =
            data.chiTiet_NhanHangs &&
            JSON.parse(data.chiTiet_NhanHangs).map((data) => {
              return {
                ...data,
                soLuongCu: data.soLuong,
              };
            });
          setListVatTu(chiTiet);

          setFieldsValue({
            oem: {
              ...data,
              ngayBanHanh: moment(data.ngayBanHanh, "DD/MM/YYYY"),
              ngayApDung: moment(data.ngayApDung, "DD/MM/YYYY"),
              isLoaiPhieu: data.isLoaiPhieu.toString(),
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
    const newData = listVatTu.filter(
      (d) =>
        d.tits_qtsx_PhieuMuaHangChiTiet_Id !==
        item.tits_qtsx_PhieuMuaHangChiTiet_Id
    );
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
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Mã vật tư/chi tiết",
      dataIndex: "maVatTuChiTiet",
      key: "maVatTuChiTiet",
      align: "center",
    },
    {
      title: "Tên vật tư/chi tiết",
      dataIndex: "tenVatTuChiTiet",
      key: "tenVatTuChiTiet",
      align: "center",
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: "maDonViTinh",
      key: "maDonViTinh",
      align: "center",
    },
    {
      title: "Thông số kỹ thuật",
      dataIndex: "thongSoKyThuat",
      key: "thongSoKyThuat",
      align: "center",
    },
    {
      title: "Vật liệu",
      dataIndex: "vatLieu",
      key: "vatLieu",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "dinhMuc",
      key: "dinhMuc",
      align: "center",
    },
    {
      title: "Mã xưởng nhận",
      dataIndex: "maXuong",
      key: "maXuong",
      align: "center",
    },
    {
      title: "Hình ảnh",
      key: "hinhAnh",
      align: "center",
      // render: (record) => renderHinhAnh(record),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
    },
    {
      title: "Lỗi",
      dataIndex: "ghiChuImport",
      key: "ghiChuImport",
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
  const handleSave = (row) => {
    const newData = [...listVatTu];
    const index = newData.findIndex(
      (item) =>
        row.tits_qtsx_PhieuMuaHangChiTiet_Id ===
        item.tits_qtsx_PhieuMuaHangChiTiet_Id
    );
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setFieldTouch(true);
    setListVatTu(newData);
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
        handleSave: handleSave,
      }),
    };
  });
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.oem);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helper.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.oem, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (oem, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...oem,
        ngayBanHanh: oem.ngayBanHanh.format("DD/MM/YYYY"),
        chiTiet_NhanHangs: listVatTu.map((dt) => {
          return {
            ...dt,
            soLuong: dt.soLuong && parseFloat(dt.soLuong),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_OEM`,
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
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...oem,
        id: id,
        tits_qtsx_PhieuMuaHang_Id: info.tits_qtsx_PhieuMuaHang_Id,
        ngayBanHanh: oem.ngayBanHanh.format("DD/MM/YYYY"),
        chiTiet_NhanHangs: listVatTu,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_OEM/${id}`,
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

  const handleSelectSanPham = (value) => {
    setSanPham(value);
  };

  const formTitle =
    type === "new" ? (
      "Tạo OEM "
    ) : type === "edit" ? (
      "Chỉnh sửa OEM"
    ) : (
      <span>
        Chi tiết OEM -{" "}
        <Tag color="blue" style={{ fontSize: "14px" }}>
          {info.maOEM}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
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
              <FormItem label="Tên OEM" name={["oem", "tenOEM"]}>
                <Input
                  className="input-item"
                  placeholder="Nhập tên OEM"
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
                label="Sản phẩm"
                name={["oem", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["id", "tenSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={handleSelectSanPham}
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
                label="Ngày ban hành"
                name={["oem", "ngayBanHanh"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
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
                label="Ngày áp dụng"
                name={["oem", "ngayApDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
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
                name={["oem", "nguoiKiemTra_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiDuyet}
                  placeholder="Chọn người kiểm tra"
                  optionsvalue={["user_Id", "fullName"]}
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
                label="Người phê duyệt"
                name={["oem", "nguoiPheDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiDuyet}
                  placeholder="Chọn người phê duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          title={"Danh sách vật tư"}
          headStyle={{
            textAlign: "center",
            backgroundColor: "#0469B9",
            color: "#fff",
          }}
        >
          {type === "new" || type === "edit" ? (
            <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
              <Button
                icon={<UploadOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={() => setActiveModal(true)}
                disabled={!SanPham ? true : false}
              >
                File import
              </Button>
            </Row>
          ) : null}
          <Table
            bordered
            columns={columns}
            scroll={{ x: 900, y: "55vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(listVatTu)}
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
            disabled={fieldTouch}
          />
        ) : null}
      </Card>
      <DanhSachImport
        openModal={ActiveModal}
        openModalFS={setActiveModal}
        DanhSachChiTiet={""}
        itemData={SanPham}
      />
    </div>
  );
};

export default OEMForm;
