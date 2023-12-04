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
  Upload,
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
  EditableTableRow,
  ModalDeleteConfirm,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  BASE_URL_API,
  DEFAULT_FORM_DIEUCHUYEN_THANHLY,
} from "src/constants/Config";
import {
  convertObjectToUrlParams,
  createGuid,
  getDateNow,
  getLocalStorage,
  getTimeNow,
  getTokenInfo,
  reDataForTable,
} from "src/util/Common";
import ModalChonSanPham from "./ModalChonSanPham";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const ThanhLySanPhamForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [info, setInfo] = useState({});
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListKhoVatTu, setListKhoVatTu] = useState([]);
  const [KhoVatTu, setKhoVatTu] = useState(null);
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalChonSanPham, setActiveModalChonSanPham] = useState(null);
  const [editingRecord, setEditingRecord] = useState([]);
  const [ListUserKy, setListUserKy] = useState([]);
  const [openImage, setOpenImage] = useState(false);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        getData();
        if (permission && permission.add) {
          setType("new");
          setFieldsValue({
            phieuthanhly: {
              ngay: moment(
                getDateNow() + " " + getTimeNow(),
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
    getUserKy(INFO);
    getListKho();
  };
  const getUserKy = (info) => {
    const params = convertObjectToUrlParams({
      donviId: info.donVi_Id,
      key: 1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}`,
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
  const getListKho = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-by-thu-tu?thutu=1&isThanhPham=true`,
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
        } else {
          setListKhoVatTu([]);
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
          `Account/cbnv/${info.user_Id}?${params}`,
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
          phieuthanhly: {
            userLap_Id: res.data.Id,
            tenPhongBan: res.data.tenPhongBan,
          },
        });
      }
    });
  };

  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      isVatTu: false,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy/${id}?${params}`,
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
          getUserKy(INFO);
          getUserLap(INFO, res.data.userLap_Id, 1);
          getListKho();
          setKhoVatTu(res.data.khoThanhLy_Id);
          setFieldsValue({
            phieuthanhly: {
              ...res.data,
              ngay: moment(res.data.ngay, "DD/MM/YYYY HH:mm:ss"),
              khoThanhLy_Id: res.data.khoThanhLy_Id,
            },
          });

          const newData =
            res.data.tits_qtsx_PhieuThanhLyChiTiets &&
            JSON.parse(res.data.tits_qtsx_PhieuThanhLyChiTiets).map((data) => {
              const vitri = `${data.tenKe ? `${data.tenKe}` : ""}${
                data.tenTang ? ` - ${data.tenTang}` : ""
              }${data.tenNgan ? ` - ${data.tenNgan}` : ""}`;

              return {
                ...data,
                tits_qtsx_ChiTietKhoVatTu_Id: data.tits_qtsx_ChiTietKhoVatTu_Id
                  ? data.tits_qtsx_ChiTietKhoVatTu_Id.toLowerCase()
                  : createGuid(),
                vatTu: `${data.maVatTu} - ${data.tenVatTu}${
                  vitri ? ` (${vitri})` : ""
                }`,
                fileImage: `${BASE_URL_API}${data.hinhAnh}`,
                hinhAnhGoc: data.hinhAnh,
                hinhAnh: data.hinhAnh ? data.hinhAnh.split("/")[5] : null,
              };
            });
          setListVatTu(newData);
        }
      })
      .catch((error) => console.error(error));
  };

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

  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListVatTu.filter(
      (d) =>
        d.tits_qtsx_ChiTietKhoVatTu_Id !== item.tits_qtsx_ChiTietKhoVatTu_Id
    );
    setListVatTu(newData);
    setFieldTouch(true);
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
    const soLuongThanhLy = val.target.value;
    if (isEmpty(soLuongThanhLy) || Number(soLuongThanhLy) <= 0) {
      setFieldTouch(false);
      setEditingRecord([...editingRecord, item]);
      item.message = "Số lượng phải là số lớn hơn 0 và bắt buộc";
    } else if (soLuongThanhLy > item.soLuong) {
      setFieldTouch(false);
      item.message = `Số lượng không được lớn hơn ${item.soLuongTon}`;
      setEditingRecord([...editingRecord, item]);
    } else {
      const newData = editingRecord.filter(
        (d) =>
          d.tits_qtsx_ChiTietKhoVatTu_Id !== item.tits_qtsx_ChiTietKhoVatTu_Id
      );
      setEditingRecord(newData);
      newData.length === 0 && setFieldTouch(true);
    }
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.soLuong = soLuongThanhLy;
      }
    });
    setListVatTu(newData);
  };
  const renderSoLuongThanhLy = (item) => {
    let isEditing = false;
    let message = "";
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
  const handleInputChangeDeXuat = (val, item) => {
    const deXuat = val.target.value;
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.deXuat = deXuat;
      }
    });
    setListVatTu(newData);
    setFieldTouch(true);
  };
  const renderDeuXuat = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          value={item.deXuat}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChangeDeXuat(val, item)}
        />
      </>
    );
  };
  const handleInputChangeNguyenNhan = (val, item) => {
    const nguyeNhan = val.target.value;
    const newData = [...ListVatTu];
    newData.forEach((ct, index) => {
      if (
        ct.tits_qtsx_ChiTietKhoVatTu_Id === item.tits_qtsx_ChiTietKhoVatTu_Id
      ) {
        ct.nguyenNhan = nguyeNhan;
      }
    });
    setListVatTu(newData);
    setFieldTouch(true);
  };
  const renderNguyenNhan = (item) => {
    return (
      <>
        <Input
          style={{
            textAlign: "center",
            width: "100%",
          }}
          className={`input-item`}
          value={item.nguyenNhan}
          disabled={type === "new" || type === "edit" ? false : true}
          onChange={(val) => handleInputChangeNguyenNhan(val, item)}
        />
      </>
    );
  };
  const props = {
    accept: ".png, .jpge, .jpg",
    showUploadList: false,
    maxCount: 1,
  };
  const renderHinhAnhVatTu = (record) => {
    return record.hinhAnh ? (
      <span>
        <a
          // target="_blank"
          // href={BASE_URL_API + record.hinhAnhVatTu}
          // rel="noopener noreferrer"
          onClick={() => {
            setOpenImage({ [record.key]: true });
          }}
        >
          {record.hinhAnh}
        </a>
        {(type === "new" || type === "edit") && (
          <DeleteOutlined
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => {
              const newData = [...ListVatTu];
              newData.forEach((vt) => {
                if (
                  vt.tits_qtsx_ChiTietKhoVatTu_Id ===
                  record.tits_qtsx_ChiTietKhoVatTu_Id
                ) {
                  vt.file = null;
                  vt.fileImage = null;
                  vt.hinhAnh = null;
                }
              });
              setFieldTouch(true);
              setListVatTu(newData);
            }}
          />
        )}
        <Image
          width={100}
          src={record.fileImage}
          alt="preview"
          style={{
            display: "none",
          }}
          preview={{
            visible: openImage[record.key],
            scaleStep: 0.5,
            src: record.fileImage,
            onVisibleChange: (value) => {
              setOpenImage({ [record.key]: value });
            },
          }}
        />
      </span>
    ) : (
      <Upload
        {...props}
        beforeUpload={(file) => {
          const newData = [...ListVatTu];
          newData.forEach((vt) => {
            if (
              vt.tits_qtsx_ChiTietKhoVatTu_Id ===
              record.tits_qtsx_ChiTietKhoVatTu_Id
            ) {
              const reader = new FileReader();
              reader.onload = (e) => (vt.fileImage = e.target.result);
              reader.readAsDataURL(file);
              vt.file = file;
              setFieldTouch(true);
              vt.hinhAnh = file.name;
            }
          });
          setListVatTu(newData);

          return false;
        }}
      >
        <Button>Tải file</Button>
      </Upload>
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
    // {
    //   title: "Ngày nhập kho",
    //   dataIndex: "ngayNhapKho",
    //   key: "ngayNhapKho",
    //   align: "center",
    // },
    {
      title: "Vị trí",
      key: "viTri",
      align: "center",
      render: (val) => {
        return (
          <span>
            {val.tenKe && val.tenKe}
            {val.tenTang && ` - ${val.tenTang}`}
            {val.tenNgan && ` - ${val.tenNgan}`}
          </span>
        );
      },
    },
    {
      title: "SL thanh lý",
      key: "soLuong",
      align: "center",
      render: (record) => renderSoLuongThanhLy(record),
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "Hình ảnh",
      key: "hinhAnh",
      align: "center",
      render: (record) => renderHinhAnhVatTu(record),
    },
    {
      title: "Đề xuất",
      key: "deXuat",
      align: "center",
      render: (record) => renderDeuXuat(record),
    },
    {
      title: "Nguyên nhân",
      key: "nguyenNhan",
      align: "center",
      render: (record) => renderNguyenNhan(record),
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
    saveData(values.phieuthanhly);
  };

  const saveAndClose = (value) => {
    validateFields()
      .then((values) => {
        if (ListVatTu.length === 0) {
          Helpers.alertError("Danh sách sản phẩm rỗng");
        } else {
          saveData(values.phieuthanhly, value);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  const postData = (data, saveQuit = false) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy`,
          "POST",
          data,
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
            getData();
            setFieldsValue({
              phieuthanhly: {
                ngay: moment(
                  getDateNow() + " " + getTimeNow(),
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
  };
  const putData = (data, saveQuit = false) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_PhieuThanhLy/${id}`,
          "PUT",
          data,
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
  };

  const saveData = (data, saveQuit = false) => {
    if (type === "new") {
      const formData = new FormData();
      const key = [];
      let check = false;
      ListVatTu.forEach((vt) => {
        if (vt.file) {
          formData.append("lstFiles", vt.file);
          check = true;
          key.push(vt.tits_qtsx_ChiTietKhoVatTu_Id);
        }
      });
      if (check) {
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((path) => {
            const newListVatTu = [];
            ListVatTu.forEach((vt) => {
              let checkPush = false;
              key.forEach((k, index) => {
                if (k === vt.tits_qtsx_ChiTietKhoVatTu_Id) {
                  checkPush = true;
                  newListVatTu.push({
                    tits_qtsx_ChiTietKhoBegin_Id:
                      vt.tits_qtsx_ChiTietKhoBegin_Id,
                    tits_qtsx_VatPham_Id: vt.tits_qtsx_VatPham_Id,
                    soLuong: vt.soLuong,
                    deXuat: vt.deXuat,
                    hinhAnh: path[index].path,
                    nguyenNhan: vt.nguyenNhan,
                  });
                }
              });
              if (!checkPush) {
                newListVatTu.push({
                  tits_qtsx_ChiTietKhoBegin_Id: vt.tits_qtsx_ChiTietKhoBegin_Id,
                  tits_qtsx_VatPham_Id: vt.tits_qtsx_VatPham_Id,
                  soLuong: vt.soLuong,
                  deXuat: vt.deXuat,
                  nguyenNhan: vt.nguyenNhan,
                  hinhAnh: null,
                });
              }
            });
            const newData = {
              ...data,
              ngay: data.ngay.format("DD/MM/YYYY HH:mm"),
              tits_qtsx_PhieuThanhLyChiTiets: newListVatTu,
              isVatTu: false,
            };
            postData(newData, saveQuit);
          });
      } else {
        const newData = {
          ...data,
          ngay: data.ngay.format("DD/MM/YYYY HH:mm"),
          tits_qtsx_PhieuThanhLyChiTiets: ListVatTu,
          isVatTu: false,
        };
        postData(newData, saveQuit);
      }
    } else if (type === "edit") {
      const formData = new FormData();
      const key = [];
      const listPath = [];

      let check = false;
      ListVatTu.forEach((vt) => {
        if (vt.file) {
          formData.append("lstFiles", vt.file);
          check = true;
          key.push(vt.tits_qtsx_ChiTietKhoVatTu_Id);
          if (vt.hinhAnh) {
            listPath.push({
              stringPath: vt.hinhAnhGoc,
            });
          }
        }
      });
      if (check) {
        if (listPath.length > 0) {
          dispatch(
            fetchStart(`Upload/RemoveMulti`, "POST", listPath, "EAADIT", "")
          );
        }
        fetch(`${BASE_URL_API}/api/Upload/Multi`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((path) => {
            const newListVatTu = [];
            ListVatTu.forEach((vt) => {
              let checkPush = false;
              key.forEach((k, index) => {
                if (k === vt.tits_qtsx_ChiTietKhoVatTu_Id) {
                  checkPush = true;
                  newListVatTu.push({
                    tits_qtsx_ChiTietKhoBegin_Id:
                      vt.tits_qtsx_ChiTietKhoBegin_Id,
                    tits_qtsx_VatPham_Id: vt.tits_qtsx_VatPham_Id,
                    soLuong: vt.soLuong,
                    deXuat: vt.deXuat,
                    hinhAnh: path[index].path,
                    nguyenNhan: vt.nguyenNhan,
                  });
                }
              });
              if (!checkPush) {
                newListVatTu.push({
                  tits_qtsx_ChiTietKhoBegin_Id: vt.tits_qtsx_ChiTietKhoBegin_Id,
                  tits_qtsx_VatPham_Id: vt.tits_qtsx_VatPham_Id,
                  soLuong: vt.soLuong,
                  deXuat: vt.deXuat,
                  nguyenNhan: vt.nguyenNhan,
                  hinhAnh: vt.hinhAnhGoc ? vt.hinhAnhGoc : null,
                });
              }
            });
            const newData = {
              ...data,
              ngay: data.ngay.format("DD/MM/YYYY HH:mm"),
              tits_qtsx_PhieuThanhLyChiTiets: newListVatTu,
              isVatTu: false,
            };
            putData(newData, saveQuit);
          });
      } else {
        const newData = {
          ...data,
          ngay: data.ngay.format("DD/MM/YYYY HH:mm"),
          tits_qtsx_PhieuThanhLyChiTiets: ListVatTu,
          isVatTu: false,
        };
        putData(newData, saveQuit);
      }
    }
  };

  const handleChonVatTu = () => {
    setActiveModalChonSanPham(true);
  };

  const handleThemVatTu = (data) => {
    const newListVatTu = [...ListVatTu, ...data];
    setListVatTu(newListVatTu);
    if (type === "edit") {
      setFieldTouch(true);
    }
  };

  const handleSelectKhoThanhLy = (value) => {
    setKhoVatTu(value);
  };

  const formTitle =
    type === "new" ? (
      "Tạo phiếu thanh lý thành phẩm "
    ) : type === "edit" ? (
      "Chỉnh sửa phiếu thanh lý thành phẩm"
    ) : (
      <span>
        Chi tiết phiếu thanh lý thành phẩm -{" "}
        <Tag
          color={
            info.tinhTrang === "Đã xác nhận"
              ? "blue"
              : info.tinhTrang === "Đã từ chối"
              ? "red"
              : "green"
          }
          style={{ fontSize: "14px" }}
        >
          {info.maPhieu}
        </Tag>
        <Tag
          color={
            info.tinhTrang === "Đã xác nhận"
              ? "blue"
              : info.tinhTrang === "Đã từ chối"
              ? "red"
              : "green"
          }
          style={{ fontSize: "14px" }}
        >
          {info.tinhTrang}
          {info.LyDoNguoiTruongBoPhanTuChoi
            ? " - " + info.LyDoNguoiTruongBoPhanTuChoi
            : null}
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
                name={["phieuthanhly", "userLap_Id"]}
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
                name={["phieuthanhly", "tenPhongBan"]}
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
                label="Kho thanh lý"
                name={["phieuthanhly", "tits_qtsx_CauTrucKho_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListKhoVatTu ? ListKhoVatTu : []}
                  optionsvalue={["id", "tenCauTrucKho"]}
                  style={{ width: "100%" }}
                  placeholder="Kho thanh lý"
                  showSearch
                  optionFilterProp={"name"}
                  onSelect={handleSelectKhoThanhLy}
                  disabled={
                    ListVatTu &&
                    ListVatTu.length === 0 &&
                    (type === "new" || type === "edit")
                      ? false
                      : true
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
                label="Ngày thanh lý"
                name={["phieuthanhly", "ngay"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <DatePicker
                  format={"DD/MM/YYYY HH:mm:ss"}
                  allowClear={false}
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
                label="Nội dung"
                name={["phieuthanhly", "noiDung"]}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input
                  placeholder="Nhập nội dung thanh lý"
                  disabled={type === "new" || type === "edit" ? false : true}
                ></Input>
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
                label="Trưởng bộ phận"
                name={["phieuthanhly", "nguoiTruongBoPhan_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Trưởng bộ phận"
                  showSearch
                  optionFilterProp={"name"}
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
                label="Duyệt BP kế toán"
                name={["phieuthanhly", "nguoiBPKeToanDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Duyệt BP kế toán"
                  showSearch
                  optionFilterProp={"name"}
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
                label="Phòng R&D"
                name={["phieuthanhly", "nguoiPhongRD_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Phòng R&D"
                  showSearch
                  optionFilterProp={"name"}
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
                name={["phieuthanhly", "nguoiDuyet_Id"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Select
                  className="heading-select slt-search th-select-heading"
                  data={ListUserKy ? ListUserKy : []}
                  optionsvalue={["user_Id", "fullName"]}
                  style={{ width: "100%" }}
                  placeholder="Duyệt"
                  showSearch
                  optionFilterProp={"name"}
                  disabled={type === "new" || type === "edit" ? false : true}
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
          dataSource={reDataForTable(ListVatTu)}
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
            disabled={type === "new" ? fieldTouch && ListVatTu : fieldTouch}
          />
        ) : null}
      </Card>
      <ModalChonSanPham
        openModal={ActiveModalChonSanPham}
        openModalFS={setActiveModalChonSanPham}
        itemData={{
          kho_Id: KhoVatTu,
          ListViTriKho: ListVatTu && ListVatTu,
        }}
        ThemVatTu={handleThemVatTu}
      />
    </div>
  );
};

export default ThanhLySanPhamForm;
