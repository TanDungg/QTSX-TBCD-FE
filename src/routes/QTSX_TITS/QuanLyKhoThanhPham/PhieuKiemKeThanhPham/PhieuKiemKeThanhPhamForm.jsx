import {
  DeleteOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Button,
  Tag,
  Modal as AntModal,
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
  Modal,
} from "src/components/Common";
import { useSelector } from "react-redux";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_TWO_COL } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getThangNow,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalThemThanhPham from "./ModalThemThanhPham";
import ModalChonHoiDongKiemKe from "./ModalChonHoiDongKiemKe";
import ModalTuChoi from "./ModalTuChoi";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const PhieuKiemKeThanhPhamForm = ({ history, match, permission }) => {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListThanhPham, setListThanhPham] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListKhoThanhPham, setListKhoThanhPham] = useState([]);
  const [ListNguoiKiemKe, setListNguoiKiemKe] = useState([]);
  const [KhoThanhPham, setKhoThanhPham] = useState(null);
  const [ActiveModalHoiDongKiemKe, setActiveModalHoiDongKiemKe] =
    useState(false);
  const [ListHoiDongKiemKe, setListHoiDongKiemKe] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [ActiveModalThemThanhPham, setActiveModalThemThanhPham] =
    useState(false);
  const [ActiveModalHDKK, setActiveModalHDKK] = useState(false);
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
          getUserLap();
          getListKhoThanhPham();
          getListNguoiKiemKe();
          setFieldsValue({
            phieukiemkethanhpham: {
              ngay: moment(
                moment().format("DD/MM/YYYY HH:mm:ss"),
                "DD/MM/YYYY HH:mm:ss"
              ),
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
      } else if (includes(match.url, "duyet")) {
        if (permission && permission.edit) {
          setType("duyet");
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

  const getUserLap = (nguoiTao_Id) => {
    const params = convertObjectToUrlParams({
      id: nguoiTao_Id ? nguoiTao_Id : INFO.user_Id,
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/cbnv/${nguoiTao_Id ? nguoiTao_Id : INFO.user_Id}?${params}`,
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
          phieukiemkethanhpham: {
            nguoiTao_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };

  const getListKhoThanhPham = () => {
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

  const getListNguoiKiemKe = () => {
    const params = convertObjectToUrlParams({
      donviId: INFO.donVi_Id,
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
        setListNguoiKiemKe(res.data);
      } else {
        setListNguoiKiemKe([]);
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
          `tits_qtsx_PhieuKiemKeThanhPham/${id}?donVi_Id=${INFO.donVi_Id}`,
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
          getListKhoThanhPham();
          getListNguoiKiemKe();
          getUserLap(data.nguoiLapPhieu_Id);
          setKhoThanhPham(data.tits_qtsx_CauTrucKho_Id);

          setFieldsValue({
            phieukiemkethanhpham: {
              ...data,
              ngay: moment(data.ngay, "DD/MM/YYYY HH:mm:ss"),
            },
          });
          setListHoiDongKiemKe(
            data.list_HoiDongKiemKe && JSON.parse(data.list_HoiDongKiemKe)
          );

          setListThanhPham(
            data.tits_qtsx_PhieuKiemKeThanhPhamChiTiets &&
              JSON.parse(data.tits_qtsx_PhieuKiemKeThanhPhamChiTiets)
          );
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

  const deleteItemFunc = (item) => {
    const title = "thành phẩm";
    ModalDeleteConfirm(deleteItemAction, item, item.tenSanPham, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListThanhPham.filter(
      (d) =>
        d.tits_qtsx_ThanhPham_Id.toLowerCase() !==
        item.tits_qtsx_ThanhPham_Id.toLowerCase()
    );
    setListThanhPham(newData);
  };

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
    const soLuongKiemKe = val.target.value;
    if (isEmpty(soLuongKiemKe) || Number(soLuongKiemKe) < 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng kiểm kê phải là số lớn hơn 0 và bắt buộc";
    } else {
      const newData =
        editingRecord &&
        editingRecord.filter(
          (d) =>
            d.tits_qtsx_ThanhPham_Id.toLowerCase() !==
            item.tits_qtsx_ThanhPham_Id.toLowerCase()
        );
      if (newData.length !== 0) {
        setFieldTouch(false);
      } else {
        setFieldTouch(true);
      }
      setEditingRecord(newData);
    }
    const newData = [...ListThanhPham];

    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ThanhPham_Id.toLowerCase() ===
        item.tits_qtsx_ThanhPham_Id.toLowerCase()
      ) {
        ct.soLuong = soLuongKiemKe;
      }
    });
    setListThanhPham(newData);
  };

  const renderSoLuongKiemKe = (item) => {
    let isEditing = false;
    let message = "";
    editingRecord &&
      editingRecord.forEach((ct) => {
        if (
          ct.tits_qtsx_ThanhPham_Id.toLowerCase() ===
          item.tits_qtsx_ThanhPham_Id.toLowerCase()
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
          disabled={type === "new" || type === "edit" ? false : true}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
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
      title: "Mã thành phẩm",
      dataIndex: "maSanPham",
      key: "maSanPham",
      align: "center",
    },
    {
      title: "Tên thành phẩm",
      dataIndex: "tenSanPham",
      key: "tenSanPham",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 100,
    },
    {
      title: "SL tồn kho",
      dataIndex: "soLuongTon",
      key: "soLuongTon",
      align: "center",
    },
    {
      title: "SL kiểm kê",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongKiemKe(record),
    },
    {
      title: "Chênh lệch",
      dataIndex: "chenhLech",
      key: "chenhLech",
      align: "center",
    },
    {
      title: "Đánh giá",
      dataIndex: "danhGiaChatLuong",
      key: "danhGiaChatLuong",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
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

  let colValuesHDKK = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Họ và tên",
      dataIndex: "tenNguoiKiemKe",
      key: "tenNguoiKiemKe",
      align: "center",
    },
    {
      title: "Chức vụ",
      dataIndex: "tenChucVu",
      key: "tenChucVu",
      align: "center",
    },
  ];

  const onFinish = (values) => {
    saveData(values.phieukiemkethanhpham);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (ListThanhPham.length === 0) {
          Helper.alertError("Danh sách thành phẩm không được rỗng");
        } else {
          saveData(values.phieukiemkethanhpham, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phieukiemkethanhpham, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieukiemkethanhpham,
        ngay: phieukiemkethanhpham.ngay.format("DD/MM/YYYY HH:mm:ss"),
        list_HoiDongKiemKe:
          ListHoiDongKiemKe.length !== 0 ? ListHoiDongKiemKe : [],
        tits_qtsx_PhieuKiemKeThanhPhamChiTiets: ListThanhPham.map((dt) => {
          return {
            ...dt,
            soLuong: dt.soLuong && parseFloat(dt.soLuong),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuKiemKeThanhPham`,
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
              setListThanhPham([]);
              setListHoiDongKiemKe([]);
              getUserLap();
              setFieldsValue({
                phieukiemkethanhpham: {
                  ngay: moment(
                    moment().format("DD/MM/YYYY HH:mm:ss"),
                    "DD/MM/YYYY HH:mm:ss"
                  ),
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
        ...phieukiemkethanhpham,
        id: id,
        ngay: phieukiemkethanhpham.ngay.format("DD/MM/YYYY HH:mm:ss"),
        list_HoiDongKiemKe:
          ListHoiDongKiemKe.length !== 0 ? ListHoiDongKiemKe : [],
        tits_qtsx_PhieuKiemKeThanhPhamChiTiets: ListThanhPham.map((dt) => {
          return {
            ...dt,
            soLuong: dt.soLuong && parseFloat(dt.soLuong),
          };
        }),
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuKiemKeThanhPham/${id}`,
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

  const handleDuyet = () => {
    const newData = {
      id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuKiemKeThanhPham/duyet/${id}`,
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
    title: "Xác nhận phiếu kiểm kê thành phẩm",
    onOk: handleDuyet,
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
          `tits_qtsx_PhieuKiemKeThanhPham/duyet/${id}`,
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

  const hanldeSelectKhoKiemKe = (value) => {
    setKhoThanhPham(value);
  };

  const handleChonVatTu = () => {
    setActiveModalThemThanhPham(true);
  };

  const handleThemThanhPham = (data) => {
    const newListThanhPham = [...ListThanhPham, ...data];
    setListThanhPham(newListThanhPham);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const handleChonHDKK = (data) => {
    setListHoiDongKiemKe(data);
    setFieldTouch(true);
  };

  const disabledDate = (current) => {
    const currentMonth = getThangNow();
    const selectedMonth = moment(current).format("MM");
    return currentMonth !== selectedMonth;
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu kiểm kê thành phầm"
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu kiểm kê thành phầm"
    ) : (
      <span>
        Chi tiết phiếu kiểm kê thành phầm -{" "}
        <Tag color="blue" style={{ fontSize: "15px" }}>
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Chưa duyệt"
              ? "orange"
              : info.tinhTrang === "Đã duyệt"
              ? "blue"
              : "red"
          }
          style={{
            fontSize: "15px",
          }}
        >
          {info.tinhTrang}
        </Tag>
      </span>
    );

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Thông tin phiếu kiểm kê thành phẩm"}
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
                label="Người tạo phiếu"
                name={["phieukiemkethanhpham", "nguoiTao_Id"]}
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
                name={["phieukiemkethanhpham", "tenPhongBan"]}
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
                label="Kho kiểm kê"
                name={["phieukiemkethanhpham", "tits_qtsx_CauTrucKho_Id"]}
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
                  placeholder="Chọn kho kiểm kê"
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  onSelect={hanldeSelectKhoKiemKe}
                  optionFilterProp="name"
                  disabled={
                    ListThanhPham && ListThanhPham.length === 0 ? false : true
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
                label="Ngày kiểm kê"
                name={["phieukiemkethanhpham", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm:ss"}
                  showTime
                  allowClear={false}
                  disabled={type === "new" ? false : true}
                  disabledDate={disabledDate}
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
                label="Thành viên 2"
                name={["phieukiemkethanhpham", "thanhVien2_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiKiemKe}
                  placeholder="Chọn thành viên 2"
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
                label="Thành viên 3"
                name={["phieukiemkethanhpham", "thanhVien3_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiKiemKe}
                  placeholder="Chọn thành viên 3"
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
                label="PT bộ phận"
                name={["phieukiemkethanhpham", "phuTrachBoPhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListNguoiKiemKe}
                  placeholder="Chọn PT bộ phận"
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
                label="Nội dung kiểm kê"
                name={["phieukiemkethanhpham", "noiDung"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập nội dung kiểm kê"
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
              <FormItem label="Hội đồng kiểm kê">
                {ListHoiDongKiemKe.length !== 0 && (
                  <Button
                    icon={<SearchOutlined />}
                    className="th-margin-bottom-0"
                    type="primary"
                    onClick={() => setActiveModalHDKK(true)}
                  >
                    Xem chi tiết
                  </Button>
                )}
                {(type === "new" || type === "edit") && (
                  <Button
                    icon={
                      ListHoiDongKiemKe.length === 0 ? (
                        <PlusCircleOutlined />
                      ) : (
                        <EditOutlined />
                      )
                    }
                    className="th-margin-bottom-0"
                    type="primary"
                    onClick={() => setActiveModalHoiDongKiemKe(true)}
                  >
                    {ListHoiDongKiemKe.length === 0
                      ? `Thêm hội đồng kiểm kê`
                      : `Chỉnh sửa hội đồng kiểm kê`}
                  </Button>
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        title={"Danh sách thành phẩm"}
        headStyle={{
          textAlign: "center",
          backgroundColor: "#0469B9",
          color: "#fff",
        }}
      >
        {(type === "new" || type === "edit") && (
          <Row justify={"end"} style={{ padding: "0px 20px 10px 20px" }}>
            <Button
              icon={<PlusCircleOutlined />}
              className="th-margin-bottom-0"
              type="primary"
              onClick={handleChonVatTu}
              disabled={KhoThanhPham === null ? true : false}
            >
              Chọn thành phẩm
            </Button>
          </Row>
        )}
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListThanhPham)}
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
      {type === "duyet" && info.tinhTrang === "Chưa duyệt" ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            icon={<RollbackOutlined />}
            className="th-margin-bottom-0"
            type="default"
            onClick={goBack}
          >
            Quay lại
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            className="th-margin-bottom-0"
            type="primary"
            onClick={modalXK}
          >
            Xác nhận
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            className="th-margin-bottom-0"
            type="danger"
            onClick={() => setActiveModalTuChoi(true)}
          >
            Từ chối
          </Button>
        </div>
      ) : null}
      <ModalThemThanhPham
        openModal={ActiveModalThemThanhPham}
        openModalFS={setActiveModalThemThanhPham}
        itemData={{
          tits_qtsx_CauTrucKho_Id: KhoThanhPham,
          ListThanhPham: ListThanhPham && ListThanhPham,
        }}
        DataThemThanhPham={handleThemThanhPham}
      />
      <ModalChonHoiDongKiemKe
        openModal={ActiveModalHoiDongKiemKe}
        openModalFS={setActiveModalHoiDongKiemKe}
        itemData={ListHoiDongKiemKe}
        DataChonHDKK={handleChonHDKK}
      />
      <AntModal
        title={`Danh sách hội đồng kiểm kê`}
        className="th-card-reset-margin"
        open={ActiveModalHDKK}
        width={width > 1200 ? `60%` : "80%"}
        closable={true}
        onCancel={() => setActiveModalHDKK(false)}
        footer={null}
      >
        <Table
          bordered
          columns={colValuesHDKK}
          scroll={{ x: 700, y: "40vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(ListHoiDongKiemKe)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />
      </AntModal>
      <ModalTuChoi
        openModal={ActiveModalTuChoi}
        openModalFS={setActiveModalTuChoi}
        saveTuChoi={saveTuChoi}
      />
    </div>
  );
};

export default PhieuKiemKeThanhPhamForm;
