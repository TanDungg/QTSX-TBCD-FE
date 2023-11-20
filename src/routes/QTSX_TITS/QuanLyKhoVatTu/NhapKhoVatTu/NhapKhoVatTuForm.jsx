import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  Tag,
  Button,
  Upload,
} from "antd";
import { includes, isEmpty, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
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
import { BASE_URL_API, DEFAULT_FORM_NHAPKHOVATTU } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  exportPDF,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
  reDataForTable,
  renderPDF,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const NhapKhoVatTuForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const [listVatTu, setListVatTu] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [ListKho, setListKho] = useState([]);
  const [ListMaPhieu, setListMaPhieu] = useState([]);
  const [editingRecord, setEditingRecord] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  const [ChungTu, setChungTu] = useState([]);
  const [DisableUpload, setDisableUpload] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          const datetime = moment();
          setType("new");
          getUserLap(INFO);
          getUserKy(INFO);
          getKho();
          getMaPhieuNhapKho();
          setFieldsValue({
            phieunhapkhovattu: {
              ngayNhapKho: moment(
                datetime.format("DD/MM/YYYY HH:mm:ss"),
                "DD/MM/YYYY HH:mm:ss"
              ),
              ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
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
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          phieunhapkhovattu: {
            userNhan_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      } else {
      }
    });
  };

  const getMaPhieuNhapKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoVatTu/phieu-nhan-hang-chua-nhap`,
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
        setListMaPhieu(res.data);
      } else {
        setListMaPhieu([]);
      }
    });
  };

  const getKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu-tree`,
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
        setListKho(res.data);
      } else {
        setListKho([]);
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
          `tits_qtsx_PhieuNhapKhoVatTu/${id}?${params}`,
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
          const newData =
            res.data.chiTietVatTu &&
            JSON.parse(res.data.chiTietVatTu).map((data) => {
              return {
                ...data,
                tits_qtsx_PhieuNhanHang_Id:
                  data.tits_qtsx_PhieuNhanHang_Id.toLowerCase(),
                thoiGianSuDung: data.thoiGianSuDung
                  ? data.thoiGianSuDung
                  : null,
              };
            });
          setListVatTu(newData ? newData : []);
          getUserLap(INFO, res.data.userNhan_Id);
          getUserKy(INFO);
          setInfo(res.data);
          getKho();
          getMaPhieuNhapKho(res.data.phieuNhanHang_Id);

          setFieldsValue({
            phieunhapkhovattu: {
              ...res.data,
              ngayNhapKho: res.data.ngayNhapKho
                ? moment(res.data.ngayNhapKho, "DD/MM/YYYY HH:mm:ss")
                : null,
              ngayHoaDon: res.data.ngayHoaDon
                ? moment(res.data.ngayHoaDon, "DD/MM/YYYY")
                : null,
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
      (d) => d.tits_qtsx_PhieuNhanHang_Id !== item.tits_qtsx_PhieuNhanHang_Id
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
  const renderDatePicker = (record) => {
    return (
      <DatePicker
        format={"DD/MM/YYYY"}
        disabled={type === "new" || type === "edit" ? false : true}
        value={
          record.hanSuDung
            ? moment(record.hanSuDung, "DD/MM/YYYY")
            : moment(getDateNow(), "DD/MM/YYYY")
        }
        allowClear={false}
        onChange={(date, dateString) => {
          const newVatTu = [...listVatTu];
          newVatTu.forEach((vt, index) => {
            if (
              vt.tits_qtsx_PhieuNhanHang_Id ===
              record.tits_qtsx_PhieuNhanHang_Id
            ) {
              newVatTu[index].thoiGianSuDung = dateString;
            }
          });
          setListVatTu(newVatTu);
          setFieldTouch(true);
        }}
      />
    );
  };

  const handleInputChange = (val, item) => {
    const soLuongNhap = val.target.value;
    if (isEmpty(soLuongNhap) || Number(soLuongNhap) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (Number(soLuongNhap) > item.soLuongNhan) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = `Số lượng phải nhỏ hơn ${item.soLuongNhan}`;
    } else {
      const newData = editingRecord.filter(
        (d) => d.tits_qtsx_PhieuNhanHang_Id !== item.tits_qtsx_PhieuNhanHang_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...listVatTu];
    newData.forEach((ct, index) => {
      if (ct.tits_qtsx_PhieuNhanHang_Id === item.tits_qtsx_PhieuNhanHang_Id) {
        ct.soLuongNhap = soLuongNhap;
      }
    });
    setListVatTu(newData);
  };

  const rendersoLuong = (record, value) => {
    let isEditing = false;
    let message = "";
    editingRecord.forEach((ct) => {
      if (ct.tits_qtsx_PhieuNhanHang_Id === record.tits_qtsx_PhieuNhanHang_Id) {
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
          value={record.soLuong}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChange(val, record, value)}
        />
        {isEditing && <div style={{ color: "red" }}>{message}</div>}
      </>
    );
  };

  const changeGhiChu = (val, item) => {
    const ghiChu = val.target.value;
    const newData = [...listVatTu];
    newData.forEach((sp, index) => {
      if (sp.tits_qtsx_PhieuNhanHang_Id === item.tits_qtsx_PhieuNhanHang_Id) {
        sp.ghiChu = ghiChu;
      }
    });
    setListVatTu(newData);
  };

  const renderGhiChu = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          value={item.ghiChu}
          onChange={(val) => changeGhiChu(val, item)}
          disabled={type === "new" || type === "edit" ? false : true}
        />
      </>
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
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Số lượng chưa nhập",
      dataIndex: "soLuongChuaNhap",
      key: "soLuongChuaNhap",
      align: "center",
    },
    {
      title: "Số lượng nhập",
      key: "soLuong",
      align: "center",
      render: (record) => rendersoLuong(record),
    },
    {
      title: "Hạn sử dụng",
      key: "hanSuDung",
      align: "center",
      render: (record) => renderDatePicker(record),
    },
    {
      title: "Ghi chú",
      key: "ghiChu",
      align: "center",
      render: (record) => renderGhiChu(record),
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
        row.tits_qtsx_PhieuNhanHang_Id === item.tits_qtsx_PhieuNhanHang_Id
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
    saveData(values.phieunhapkhovattu);
  };

  const saveAndClose = (val) => {
    validateFields()
      .then((values) => {
        if (listVatTu.length === 0) {
          Helpers.alertError("Danh sách vật tư rỗng");
        } else {
          saveData(values.phieunhapkhovattu, val);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (phieunhapkhovattu, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...phieunhapkhovattu,
        ngayNhapKho: phieunhapkhovattu.ngayNhapKho.format(
          "DD/MM/YYYY HH:mm:ss"
        ),
        list_ChungTu: ChungTu.map((chungtu) => {
          const filechungtu = [];

          for (const key in phieunhapkhovattu) {
            if (
              key.startsWith("fileChungTu") &&
              key.slice(11) === chungtu.maChungTu
            ) {
              filechungtu.push(phieunhapkhovattu[key].file);
            }
          }

          return {
            ...chungtu,
            fileChungTu: filechungtu.length > 0 ? filechungtu[0] : null,
          };
        }),
        tits_qtsx_PhieuNhapKhoVatTuChiTiets: listVatTu,
      };
      console.log(newData);
      // new Promise((resolve, reject) => {
      //   dispatch(
      //     fetchStart(
      //       `tits_qtsx_PhieuNhapKhoVatTu`,
      //       "POST",
      //       newData,
      //       "ADD",
      //       "",
      //       resolve,
      //       reject
      //     )
      //   );
      // })
      //   .then((res) => {
      //     if (res.status !== 409) {
      //       if (saveQuit) {
      //         goBack();
      //       } else {
      //         resetFields();
      //         getUserLap(INFO);
      //         getUserKy(INFO);
      //         getKho();
      //         getMaPhieuNhapKho();
      //         setFieldsValue({
      //           phieunhapkhovattu: {
      //             ngayNhapKho: moment(getDateNow(), "DD/MM/YYYY HH:mm:ss"),
      //             ngayHoaDon: moment(getDateNow(), "DD/MM/YYYY"),
      //           },
      //         });
      //         setFieldTouch(false);
      //         setListVatTu([]);
      //       }
      //     } else {
      //       setFieldTouch(false);
      //     }
      //   })
      //   .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        id: id,
        ...phieunhapkhovattu,
        ngayNhapKho: phieunhapkhovattu.ngayNhapKho.format(
          "DD/MM/YYYY HH:mm:ss"
        ),
        tits_qtsx_PhieuNhapKhoVatTuChiTiets: listVatTu.map((vt) => {
          return {
            ...vt,
            tits_qtsx_PhieuNhapKhoVatTu_Id: id,
          };
        }),
      };

      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_PhieuNhapKhoVatTu/${id}`,
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

  const formTitle =
    type === "new" ? (
      "Tạo phiếu nhập kho vật tư "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu nhập kho vật tư"
    ) : (
      <span>
        Chi tiết phiếu nhập kho vật tư -{" "}
        <Tag color={"success"}>{info.maPhieuNhapKhoVatTu}</Tag>
      </span>
    );

  const hanldeSelectMaPhieu = (value) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuNhapKhoVatTu/phieu-nhan-hang-chi-tiet-chua-nhap?tits_qtsx_PhieuNhanHang_Id=${value}`,
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
          setListVatTu(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const renderFileChungTu = () => {
    const chungtu = [];
    const [FileChungTu, setFileChungTu] = useState([]);

    const handleFileChange = (index, file) => {
      const newChungTu = [...FileChungTu];
      newChungTu[index] = file;
      setFileChungTu(newChungTu);
    };

    for (let i = 0; i < ChungTu.length; i++) {
      const props = {
        accept: ".pdf",
        beforeUpload: (file) => {
          const isPDF = file.type === "application/pdf";

          if (!isPDF) {
            Helpers.alertError(`${file.name} không phải là file PDF`);
          } else {
            handleFileChange(i, file);
            return false;
          }
        },
        showUploadList: false,
        maxCount: 1,
      };

      chungtu.push(
        <Col
          key={i}
          xxl={12}
          xl={12}
          lg={24}
          md={24}
          sm={24}
          xs={24}
          style={{ marginBottom: 8 }}
        >
          <Form.Item
            label={`File chứng từ ${ChungTu[i].maChungTu}`}
            name={["phieunhapkhovattu", `fileChungTu${ChungTu[i].maChungTu}`]}
            rules={[
              {
                type: "file",
                required: true,
              },
            ]}
          >
            {!FileChungTu[i] ? (
              <Upload {...props}>
                <Button
                  style={{ marginBottom: 0 }}
                  icon={<UploadOutlined />}
                  disabled={type === "xacnhan" || type === "detail"}
                >
                  File chứng từ {ChungTu[i].maChungTu}
                </Button>
              </Upload>
            ) : (
              <span>
                <span
                  style={{ color: "#0469B9", cursor: "pointer" }}
                  onClick={() => renderPDF(FileChungTu[i])}
                >
                  {FileChungTu[i].name.length > 30
                    ? FileChungTu[i].name.substring(0, 30) + "..."
                    : FileChungTu[i].name}{" "}
                </span>
                <DeleteOutlined
                  style={{ cursor: "pointer", color: "red" }}
                  disabled={type === "new" || type === "edit" ? false : true}
                  onClick={() => handleFileChange(i, null)}
                />
              </span>
            )}
          </Form.Item>
        </Col>
      );
    }

    return chungtu;
  };

  const hanldeSelectChungTu = (value) => {
    const newChungTu = ListKho.filter((d) => d.id === value);
    setChungTu(newChungTu[0].chiTietChungTus && newChungTu[0].chiTietChungTus);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_NHAPKHOVATTU}
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
                label="Người nhập"
                name={["phieunhapkhovattu", "userNhan_Id"]}
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
                name={["phieunhapkhovattu", "tenPhongBan"]}
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
                label="Phiếu nhận hàng"
                name={["phieunhapkhovattu", "tits_qtsx_PhieuNhanHang_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListMaPhieu}
                  placeholder="Chọn phiếu nhận hàng"
                  optionsvalue={["tits_qtsx_PhieuNhanHang_Id", "maPhieu"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" ? false : true}
                  onSelect={hanldeSelectMaPhieu}
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
                label="Biên bản bàn giao"
                name={["phieunhapkhovattu", "bienBanBanGiao"]}
                rules={[
                  {
                    required: true,
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Biên bản bàn giao"
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
                label="Kho nhập"
                name={["phieunhapkhovattu", "tits_qtsx_CauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKho}
                  placeholder="Chọn kho nhập"
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  onSelect={hanldeSelectChungTu}
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
                label="Ngày nhập kho"
                name={["phieunhapkhovattu", "ngayNhapKho"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm:ss"}
                  disabled={type === "new" || type === "edit" ? false : true}
                  showTime
                  allowClear={false}
                  onChange={(date, dateString) => {
                    setFieldsValue({
                      phieunhapkhovattu: {
                        ngayNhapKho: moment(dateString, "DD/MM/YYYY HH:mm:ss"),
                      },
                    });
                  }}
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
                label="Số phiếu kiểm tra"
                name={["phieunhapkhovattu", "soPhieuKiemTra"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input
                  placeholder="Số phiểu kiểm tra"
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
                label="Nội dung nhập"
                name={["phieunhapkhovattu", "noiDung"]}
                rules={[
                  {
                    type: "string",
                  },
                ]}
              >
                <Input
                  placeholder="Nội dung nhập"
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
                label="Người giao"
                name={["phieunhapkhovattu", "nguoiGiao_Id"]}
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
                  placeholder="Người giao"
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
                name={["phieunhapkhovattu", "nguoiDuyet_Id"]}
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
                  placeholder="Người duyệt"
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  showSearch
                  optionFilterProp="name"
                  disabled={type === "new" || type === "edit" ? false : true}
                />
              </FormItem>
            </Col>
            {renderFileChungTu()}
          </Row>
        </Form>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 900, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(listVatTu && listVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          // loading={loading}
        />
        {type === "new" || type === "edit" ? (
          <FormSubmit
            goBack={goBack}
            handleSave={saveAndClose}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        ) : null}
      </Card>
    </div>
  );
};

export default NhapKhoVatTuForm;
