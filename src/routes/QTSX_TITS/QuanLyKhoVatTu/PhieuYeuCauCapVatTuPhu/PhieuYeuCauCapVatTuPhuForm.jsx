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
  Image,
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
  ModalDeleteConfirm,
  Modal,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_DENGHI_CVT } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import AddVatTuModal from "./ModalChonVatTu";
import ModalTuChoi from "./ModalTuChoi";
import dayjs from "dayjs";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuDeNghiCapVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [ListXuong, setListXuong] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [ActiveModalChonVatTu, setActiveModalChonVatTu] = useState(false);
  const { validateFields, resetFields, setFieldsValue, getFieldValue } = form;
  const [info, setInfo] = useState({});
  const [editingRecord, setEditingRecord] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getUserKy(INFO);
          getUserLap(INFO, null);
          getXuong();
          setFieldsValue({
            phieuyeucaucapvattuphu: {
              ngay: moment(getDateNow(), "DD/MM/YYYY"),
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
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "chi-tiet")) {
        if (permission && permission.edit) {
          setType("detail");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      } else if (includes(match.url, "xac-nhan")) {
        if (permission && permission.edit) {
          setType("xacnhan");
          const { id } = match.params;
          setId(id);
          getInfo(id);
          getUserKy(INFO);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Xuong?page=-1`,
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
        setListXuong(res.data);
      } else {
        setListXuong([]);
      }
    });
  };

  const getUserLap = (info, nguoiTao_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : info.user_Id,
      donVi_Id: info.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : info.user_Id}?${params}`,
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
          phieuyeucaucapvattuphu: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
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
        setListUserKy(res.data);
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
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuYeuCauCapVatTu/${id}?${params}`,
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
          getXuong();
          getUserLap(INFO, res.data.nguoiTao_Id);
          setFieldsValue({
            phieuyeucaucapvattuphu: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY"),
            },
          });
          const chiTiet =
            res.data.list_ChiTiets && JSON.parse(res.data.list_ChiTiets);
          setListVatTu(chiTiet && chiTiet);
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
    const newData = ListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    setListVatTu(newData);
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
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) < 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng không được âm và bắt buộc";
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
        ct.soLuongCan = soLuongNhap;
        ct.soLuongYeuCau = soLuongNhap
          ? parseFloat(soLuongNhap) + parseFloat(ct.soLuongTonKho)
          : parseFloat(ct.soLuongTonKho);
      }
    });
    setListVatTu(newData);
  };

  const rendersoLuong = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id) {
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
          value={item.soLuongCan}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, item)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const renderHangMucSuDung = (record) => {
    return (
      <Input
        style={{
          textAlign: "center",
          width: "100%",
        }}
        className={`input-item`}
        disabled={type === "new" || type === "edit" ? false : true}
        value={record.hangMucSuDung}
        onChange={(val) => handleHanMucSuDung(val, record)}
      />
    );
  };

  const handleHanMucSuDung = (value, record) => {
    const hangmuc = value.target.value;
    setFieldTouch(true);
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_VatTu_Id === record.tits_qtsx_VatTu_Id) {
        ct.hangMucSuDung = hangmuc;
      }
    });
    setListVatTu(newData);
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
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "SL cần",
      key: "soLuongCan",
      align: "center",
      render: (record) => rendersoLuong(record),
    },
    {
      title: "SL tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "SL yêu cầu thêm",
      dataIndex: "soLuongYeuCau",
      key: "soLuongYeuCau",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      key: "hangMucSuDung",
      align: "center",
      render: (record) => renderHangMucSuDung(record),
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      render: (value) => (
        <span>
          <Image
            src={BASE_URL_API + value}
            alt="Hình ảnh"
            style={{ maxWidth: 100, maxHeight: 100 }}
          />
        </span>
      ),
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
    saveData(values.phieuyeucaucapvattuphu);
  };

  const saveAndClose = (check) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieuyeucaucapvattuphu, check);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phieuyeucaucapvattuphu, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieuyeucaucapvattuphu,
        ngay: phieuyeucaucapvattuphu.ngay.format("DD/MM/YYYY"),
        list_ChiTiets: ListVatTu.map((vattu) => {
          return {
            ...vattu,
            soLuongCan: parseFloat(vattu.soLuongCan),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuYeuCauCapVatTu`,
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
              getUserKy(INFO);
              getUserLap(INFO, null);
              getXuong();
              setFieldsValue({
                phieuyeucaucapvattuphu: {
                  ngay: moment(getDateNow(), "DD/MM/YYYY"),
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
        ...phieuyeucaucapvattuphu,
        id: id,
        ngay: phieuyeucaucapvattuphu.ngay.format("DD/MM/YYYY"),
        list_ChiTiets: ListVatTu.map((vattu) => {
          return {
            ...vattu,
            soLuongCan: parseFloat(vattu.soLuongCan),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuYeuCauCapVatTu/${id}`,
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
            getUserLap(INFO, null);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleXacNhan = () => {
    const newData = {
      id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuYeuCauCapVatTu/duyet/${id}`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          getInfo(id);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận phiếu đề nghị cấp vật tư phụ",
    onOk: handleXacNhan,
  };

  const modalXK = () => {
    Modal(prop);
  };

  const saveTuChoi = (data) => {
    const newData = {
      id: id,
      lyDoTuChoi: data,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuYeuCauCapVatTu/duyet/${id}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) getInfo(id);
      })
      .catch((error) => console.error(error));
  };

  const DataThemVatTu = (data) => {
    setListVatTu([...ListVatTu, ...data]);
    setFieldTouch(true);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu đề nghị cấp vật tư phụ"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu đề nghị cấp vật tư phụ"
    ) : (
      <span>
        Chi tiết phiếu đề nghị cấp vật tư phụ -{" "}
        <Tag color={"blue"} style={{ fontSize: "14px" }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "orange"
              : info.tinhTrang === "Đã duyệt"
              ? "blue"
              : info.tinhTrang && info.tinhTrang.startsWith("Bị hủy")
              ? "red"
              : "cyan"
          }
          style={{
            fontSize: "14px",
          }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_DENGHI_CVT}
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
                name={["phieuyeucaucapvattuphu", "nguoiTao_Id"]}
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
                name={["phieuyeucaucapvattuphu", "tenPhongBan"]}
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
                label="Xưởng sản xuất"
                name={["phieuyeucaucapvattuphu", "tits_qtsx_Xuong_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  placeholder="Xưởng sản xuất"
                  className="heading-select slt-search th-select-heading"
                  data={ListXuong ? ListXuong : []}
                  optionsvalue={["id", "tenXuong"]}
                  style={{ width: "100%" }}
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
                label="Ngày yêu cầu"
                name={["phieuyeucaucapvattuphu", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  disabled={true}
                  format={"DD/MM/YYYY"}
                  allowClear={false}
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
                name={["phieuyeucaucapvattuphu", "nguoiKiemTra_Id"]}
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
                label="Kế toán duyệt"
                name={["phieuyeucaucapvattuphu", "nguoiKeToanDuyet_Id"]}
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
                label="Người duyệt"
                name={["phieuyeucaucapvattuphu", "nguoiDuyet_Id"]}
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
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {info.lyDoHuy ? (
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem label="Lý do hủy">
                  <Input
                    className="input-item"
                    disabled={true}
                    value={info.lyDoHuy}
                  />
                </FormItem>
              </Col>
            ) : null}
          </Row>
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Thông tin vật tư"}
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
              scroll={{ x: 900, y: "55vh" }}
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
              handleSave={onFinish}
              saveAndClose={saveAndClose}
              disabled={fieldTouch || !ListVatTu}
            />
          ) : null}
        </Form>
        {(type === "xacnhan" &&
          info.tinhTrang === "Chưa duyệt" &&
          info.nguoiKeToanDuyet_Id === INFO.user_Id) ||
        (type === "xacnhan" &&
          info.tinhTrang === "Chờ người duyệt xác nhận" &&
          info.nguoiKeToanDuyet_Id === INFO.user_Id) ? (
          <Row justify={"end"} style={{ marginTop: 15 }}>
            <Col style={{ marginRight: 15 }}>
              <Button type="primary" onClick={modalXK}>
                Xác nhận
              </Button>
            </Col>
            <Col style={{ marginRight: 15 }}>
              <Button type="danger" onClick={() => setActiveModalTuChoi(true)}>
                Từ chối
              </Button>
            </Col>
          </Row>
        ) : null}
      </Card>
      <AddVatTuModal
        openModal={ActiveModalChonVatTu}
        openModalFS={setActiveModalChonVatTu}
        DataThemVatTu={DataThemVatTu}
        itemData={ListVatTu && ListVatTu}
      />
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default PhieuDeNghiCapVatTuForm;
