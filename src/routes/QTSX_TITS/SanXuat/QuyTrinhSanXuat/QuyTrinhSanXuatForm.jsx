import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Mentions,
  Row,
  Switch,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";
import {
  Input,
  Select,
  FormSubmit,
  Table,
  EditableTableRow,
  ModalDeleteConfirm,
} from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_QTSX } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Link } from "react-router-dom";
import ModalCongDoan from "./ModalCongDoan";
import Helpers from "src/helpers";
import ModalTram from "./ModalTram";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function QuyTrinhSanXuatForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading } = useSelector(({ common }) => common).toJS();
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const { setFieldsValue, validateFields, resetFields } = form;
  const [id, setId] = useState(undefined);
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListNhanVien, setListNhanVien] = useState([]);
  const [ActiveModalCongDoan, setActiveModalCongDoan] = useState(false);
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [ActiveModalTram, setActiveModalTram] = useState(false);
  const [Tram, setTram] = useState({});
  const [ActiveModalChiTietTram, setActiveModalChiTietTram] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getListSanPham();
        getUserKy(INFO.donVi_Id);
        setFieldsValue({
          quytrinhsanxuat: {
            ngayDuyet: moment(getDateNow(), "DD/MM/YYYY"),
            ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
          },
        });
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getListSanPham();
        }
      }
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListSanPham = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_SanPham?page=-1`,
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
        setListNhanVien(res.data);
      } else {
        setListNhanVien([]);
      }
    });
  };

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/${id}`,
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
          setFieldsValue({
            quytrinhsanxuat: {
              ...res.data,
              ngayDuyet: moment(res.data.ngayDuyet, "DD/MM/YYYY"),
              ngayApDung: moment(res.data.ngayApDung, "DD/MM/YYYY"),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const handleModalTram = (item) => {
    console.log(item);
    setTram(item);
    setActiveModalTram(true);
  };

  const actionContent = (item) => {
    const addtram = { onClick: () => handleModalTram(item) };

    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item },
          }}
          title="sửa công đoạn"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa công đoạn">
          <EditOutlined />
        </span>
      );

    const deleteVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item, "công đoạn") }
        : { disabled: true };

    return (
      <div>
        <a {...addtram} title="Thêm trạm">
          <PlusCircleOutlined />
        </a>
        <Divider type="vertical" />
        {editItem}
        <Divider type="vertical" />
        <a {...deleteVal} title="Xóa công đoạn">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenCongDoan, "công đoạn");
  };

  const deleteItemAction = (item) => {};

  const handleCheckboxChange = (record) => {
    const newData = ListCongDoan.map((congdoan) => {
      if (
        congdoan.tits_qtsx_CongDoan_Id === record.tits_qtsx_CongDoan_Id &&
        congdoan.tits_qtsx_Xuong_Id === record.tits_qtsx_Xuong_Id
      ) {
        return {
          ...congdoan,
          isChoPhepSCL: !congdoan.isChoPhepSCL,
        };
      }
      return congdoan;
    });

    setListCongDoan(newData);
  };

  const renderSCL = (record) => {
    return (
      <Checkbox
        checked={record.isChoPhepSCL}
        onChange={() => handleCheckboxChange(record)}
        disabled={type === "detail" ? true : false}
      />
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
      render: (value) => actionContent(value),
    },
    {
      title: "Thứ tự",
      dataIndex: "thuTu",
      key: "thuTu",
      align: "center",
      width: 120,
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Xưởng",
      dataIndex: "tenXuong",
      key: "tenXuong",
      align: "center",
    },
    {
      title: "Cho phép qua SCL",
      key: "isChoPhepSCL",
      align: "center",
      render: (record) => renderSCL(record),
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
    saveData(values.quytrinhsanxuat);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.quytrinhsanxuat, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (quytrinhsanxuat, saveQuit = false) => {
    const newData = {
      ...quytrinhsanxuat,
      ngayDuyet: quytrinhsanxuat.ngayDuyet.format("DD/MM/YYYY"),
      ngayApDung: quytrinhsanxuat.ngayApDung.format("DD/MM/YYYY"),
    };
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_QuyTrinhSanXuat`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setFieldsValue({
                quytrinhsanxuat: {
                  ngayDuyet: moment(getDateNow(), "DD/MM/YYYY"),
                  ngayApDung: moment(getDateNow(), "DD/MM/YYYY"),
                },
              });
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...quytrinhsanxuat,
        id: id,
        ngayDuyet: quytrinhsanxuat.ngayDuyet.format("DD/MM/YYYY"),
        ngayApDung: quytrinhsanxuat.ngayApDung.format("DD/MM/YYYY"),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_QuyTrinhSanXuat/${id}`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const DataThemCongDoan = (data) => {
    const congdoan =
      ListCongDoan &&
      ListCongDoan.filter(
        (d) =>
          (d.tits_qtsx_CongDoan_Id === data.tits_qtsx_CongDoan_Id &&
            d.tits_qtsx_Xuong_Id) === data.tits_qtsx_Xuong_Id
      );

    if (congdoan.length !== 0) {
      Helpers.alertError(
        `Công đoạn ${data.tenCongDoan} - ${data.tenXuong} đã được thêm`
      );
    } else {
      setListCongDoan([...ListCongDoan, data]);
    }
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const formTitle =
    type === "new"
      ? "Thêm mới quy trình sản xuất"
      : "Chỉnh sửa quy trình sản xuất";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_QTSX}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Sản phẩm"
                name={["quytrinhsanxuat", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham ? ListSanPham : []}
                  placeholder="Chọn sản phẩm"
                  optionsvalue={["id", "tenSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Loại sản phẩm"
                name={["quytrinhsanxuat", "tits_qtsx_SanPham_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListSanPham ? ListSanPham : []}
                  placeholder="Chọn loại sản phẩm"
                  optionsvalue={["id", "tenLoaiSanPham"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={true}
                />
              </FormItem>
            </Col>
            {/* <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  marginBottom: 10,
                }}
              >
                <FormItem
                  label="BOM"
                  name={["quytrinhsanxuat", "tits_qtsx_BOM_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                    },
                  ]}
                 
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListSanPham ? ListSanPham : []}
                    placeholder="Chọn BOM"
                    optionsvalue={["id", "tenSanPham"]}
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
                style={{
                  marginBottom: 10,
                }}
              >
                <FormItem
                  label="OEM"
                  name={["quytrinhsanxuat", "tits_qtsx_OEM_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                    {
                      max: 250,
                    },
                  ]}
                  
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListSanPham ? ListSanPham : []}
                    placeholder="Chọn OEM"
                    optionsvalue={["id", "tenSanPham"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={true}
                  />
                </FormItem>
              </Col> */}
          </Row>
          <Divider style={{ marginBottom: 15 }} />
          <Row>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Mã quy trình"
                name={["quytrinhsanxuat", "maQuyTrinhSanXuat"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập mã quy trình sản xuất"
                  disabled={type === "detail" ? true : false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Tên quy trình"
                name={["quytrinhsanxuat", "tenQuyTrinhSanXuat"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                  {
                    max: 250,
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập tên quy trình sản xuất"
                  disabled={type === "detail" ? true : false}
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
                name={["phieumuahangngoai", "nguoiThuMua_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhanVien}
                  placeholder="Chọn người kiểm tra"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
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
                label="Người duyệt"
                name={["phieumuahangngoai", "nguoiThuMua_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNhanVien}
                  placeholder="Chọn người duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "detail" ? true : false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Ngày duyệt"
                name={["quytrinhsanxuat", "ngayDuyet"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={type === "detail" ? true : false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Ngày áp dụng"
                name={["quytrinhsanxuat", "ngayApDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY"}
                  allowClear={false}
                  disabled={type === "detail" ? true : false}
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
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Sử dụng"
                name={["quytrinhsanxuat", "isSuDung"]}
                valuePropName="checked"
              >
                <Switch />
              </FormItem>
            </Col>
            <Col
              xxl={12}
              xl={12}
              lg={24}
              md={24}
              sm={24}
              xs={24}
              style={{
                marginBottom: 10,
              }}
            >
              <FormItem
                label="Mô tả"
                name={["quytrinhsanxuat", "moTa"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Mentions
                  className="input-item"
                  placeholder="Nhập mô tả"
                  rows={3}
                  disabled={type === "detail" ? true : false}
                />
              </FormItem>
            </Col>
          </Row>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Công đoạn sản xuất"}
            headStyle={{
              textAlign: "center",
              backgroundColor: "#0469B9",
              color: "#fff",
            }}
          >
            {(type === "new" || type === "edit") && (
              <div align={"end"}>
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={() => setActiveModalCongDoan(true)}
                  type="primary"
                >
                  Thêm công đoạn
                </Button>
              </div>
            )}
            <Table
              bordered
              columns={columns}
              scroll={{ x: 1000, y: "55vh" }}
              components={components}
              className="gx-table-responsive"
              dataSource={ListCongDoan}
              size="small"
              rowClassName={"editable-row"}
              pagination={false}
              // loading={loading}
            />
          </Card>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
      <ModalCongDoan
        openModal={ActiveModalCongDoan}
        openModalFS={setActiveModalCongDoan}
        itemData={ListCongDoan && ListCongDoan}
        DataThemCongDoan={DataThemCongDoan}
      />
      <ModalTram
        openModal={ActiveModalTram}
        openModalFS={setActiveModalTram}
        itemData={Tram}
        DataThemCongDoan={DataThemCongDoan}
      />
    </div>
  );
}

export default QuyTrinhSanXuatForm;
