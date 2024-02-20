import {
  Card,
  Col,
  Modal as AntModal,
  Row,
  Tag,
  Button,
  Form,
  Input,
  Upload,
  Divider,
  Image,
} from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeDuplicates,
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import {
  BASE_URL_API,
  HINHTHUCDAOTAO_TAPTRUNG,
  DEFAULT_FORM_ADD_2COL_130PX,
  DVDT_TRUONG_CD_THACO,
} from "src/constants/Config";
import Helpers from "src/helpers";
import {
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;
const { TextArea } = Input;

function CapNhatKetQuaDaoTao({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [IsAdmin, setIsAdmin] = useState(null);
  const [ListKienThuc, setListKienThuc] = useState([]);
  const [KienThuc, setKienThuc] = useState(null);
  const [ListChuyenDeDaoTao, setListChuyenDeDaoTao] = useState([]);
  const [ChuyenDeDaoTao, setChuyenDeDaoTao] = useState(null);
  const [ListLopHoc, setListLopHoc] = useState([]);
  const [LopHoc, setLopHoc] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ActiveModalCapNhat, setActiveModalCapNhat] = useState(false);
  const [ListDonViDaoTao, setListDonViDaoTao] = useState([]);
  const [GiayChungNhan, setGiayChungNhan] = useState(null);
  const [DisableUploadGiayChungNhan, setDisableUploadGiayChungNhan] =
    useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getIsAdmin();
      getListFilter();
      getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (
    vptq_lms_KienThuc_Id,
    vptq_lms_ChuyenDeDaoTao_Id,
    vptq_lms_LopHoc_Id,
    keyword
  ) => {
    let param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      vptq_lms_LopHoc_Id,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/list-ket-qua-dao-tao?${param}`,
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
        setData(res.data);
      } else {
        setData([]);
      }
    });
  };

  const getIsAdmin = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_BaoCao/is-admin`,
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
          setIsAdmin(res.data);
        } else {
          setIsAdmin(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListFilter = (vptq_lms_KienThuc_Id, vptq_lms_ChuyenDeDaoTao_Id) => {
    const param = convertObjectToUrlParams({
      vptq_lms_KienThuc_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/filter-list-ket-qua-dao-tao?${param}`,
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
          setListKienThuc(res.data.list_KienThucs);
          setListChuyenDeDaoTao(res.data.list_ChuyenDeDaoTaos);
          setListLopHoc(res.data.list_LopHocs);
        } else {
          setListKienThuc([]);
          setListChuyenDeDaoTao([]);
          setListLopHoc([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListDonViDaoTao = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_DonViDaoTao?page=-1`,
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
          setListDonViDaoTao(res.data);
        } else {
          setListDonViDaoTao([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchCapNhat = () => {
    getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(KienThuc, ChuyenDeDaoTao, LopHoc, val.target.value);
    }
  };

  const actionContent = (item) => {
    const capnhat =
      item.isCapNhatKetQuaDaoTao === 1
        ? {
            onClick: () => {
              setActiveModalCapNhat(true);
              setDataChiTiet(item);
              getListDonViDaoTao();
              setFieldsValue({
                formcapnhat: {
                  vptq_lms_DonViDaoTao_Id:
                    item.vptq_lms_HinhThucDaoTao_Id.toLowerCase() ===
                      HINHTHUCDAOTAO_TAPTRUNG && DVDT_TRUONG_CD_THACO,
                },
              });
            },
          }
        : { disabled: true };

    const chinhsua =
      item.tinhTrang === "Chờ duyệt"
        ? {
            onClick: () => {
              setActiveModalCapNhat(true);
              setDataChiTiet(item);
              getListDonViDaoTao();
              if (item.giayChungNhan) {
                setGiayChungNhan(item.giayChungNhan);
                setDisableUploadGiayChungNhan(true);
              }
              setFieldsValue({
                formcapnhat: {
                  giayChungNhan: item.giayChungNhan && item.giayChungNhan,
                  vptq_lms_DonViDaoTao_Id: !item.vptq_lms_DonViDaoTao_Id
                    ? item.vptq_lms_HinhThucDaoTao_Id.toLowerCase() ===
                      HINHTHUCDAOTAO_TAPTRUNG
                      ? DVDT_TRUONG_CD_THACO
                      : null
                    : item.vptq_lms_DonViDaoTao_Id,
                  moTa: item.moTa && item.moTa,
                },
              });
            },
          }
        : { disabled: true };

    return (
      <div>
        <React.Fragment>
          <a {...capnhat} title="Cập nhật kết quả đào tạo">
            <SettingOutlined />
          </a>
          <Divider type="vertical" />
          <a {...chinhsua} title="Chỉnh sửa kết quả đào tạo">
            <EditOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let dataList = reDataForTable(Data);

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 110,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maNhanVien,
            value: d.maNhanVien,
          };
        })
      ),
      onFilter: (value, record) => record.maNhanVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 140,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.fullName,
            value: d.fullName,
          };
        })
      ),
      onFilter: (value, record) => record.fullName.includes(value),
      filterSearch: true,
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 230,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenChuyenDeDaoTao,
            value: d.tenChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenDeDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLopHoc,
            value: d.tenLopHoc,
          };
        })
      ),
      onFilter: (value, record) => record.tenLopHoc.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenHinhThucDaoTao,
            value: d.tenHinhThucDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenHinhThucDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiGianDaoTao",
      key: "thoiGianDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianDaoTao,
            value: d.thoiGianDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          kết thúc
        </div>
      ),
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianKetThuc,
            value: d.thoiGianKetThuc,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianKetThuc.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời lượng
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiLuongDaoTao",
      key: "thoiLuongDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiLuongDaoTao,
            value: d.thoiLuongDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiLuongDaoTao.toString().includes(value),
      filterSearch: true,
      render: (value) => {
        return value && <span>{value} phút</span>;
      },
    },
    {
      title: "Người xác nhận",
      dataIndex: "tenNguoiXacNhan",
      key: "tenNguoiXacNhan",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiLuongDaoTao,
            value: d.thoiLuongDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiLuongDaoTao.toString().includes(value),
      filterSearch: true,
    },
    {
      title: "Giấy chứng nhận",
      dataIndex: "giayChungNhan",
      key: "giayChungNhan",
      align: "center",
      width: 130,
      render: (value) =>
        value && (
          <Image
            src={BASE_URL_API + value}
            alt="Hình ảnh"
            style={{ height: "80px" }}
          />
        ),
    },
    {
      title: "Tình trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      align: "center",
      width: 130,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tinhTrang,
            value: d.tinhTrang,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrang.includes(value),
      filterSearch: true,
      render: (value, record) =>
        value && (
          <Tag
            color={
              value === "Chưa cập nhật"
                ? ""
                : value === "Chờ duyệt"
                ? "orange"
                : value === "Hoàn thành"
                ? "blue"
                : "red"
            }
            style={{
              whiteSpace: "break-spaces",
              fontSize: 13,
            }}
          >
            {value}
          </Tag>
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.moTa,
            value: d.moTa,
          };
        })
      ),
      onFilter: (value, record) => record.moTa.includes(value),
      filterSearch: true,
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

  const handleRedirect = () => {
    history.push({
      pathname: `${match.url}/them-moi`,
    });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới kết quả đào tạo
        </Button>
      </>
    );
  };

  const handleOnSelectKienThuc = (value) => {
    setKienThuc(value);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter(value);
    getListData(value, null, null, keyword);
  };

  const handleClearKienThuc = () => {
    setKienThuc(null);
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter();
    getListData(null, null, null, keyword);
  };

  const handleOnSelectChuyenDeDaoTao = (value) => {
    setChuyenDeDaoTao(value);
    setLopHoc(null);
    getListFilter(KienThuc, value);
    getListData(KienThuc, value, null, keyword);
  };

  const handleClearChuyenDeDaoTao = () => {
    setChuyenDeDaoTao(null);
    setLopHoc(null);
    getListFilter();
    getListData(KienThuc, null, null, keyword);
  };

  const handleOnSelectLopHoc = (value) => {
    setLopHoc(value);
    getListData(KienThuc, ChuyenDeDaoTao, value, keyword);
  };

  const handleClearLopHoc = () => {
    setLopHoc(null);
    getListData(KienThuc, ChuyenDeDaoTao, null, keyword);
  };

  const props = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setGiayChungNhan(file);
        setDisableUploadGiayChungNhan(true);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const onFinish = (values) => {
    uploadFile(values.formcapnhat);
  };

  const uploadFile = (formcapnhat) => {
    if (formcapnhat.giayChungNhan) {
      if (formcapnhat.giayChungNhan.file) {
        const formData = new FormData();
        formData.append("file", formcapnhat.giayChungNhan.file);
        fetch(`${BASE_URL_API}/api/Upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: "Bearer ".concat(INFO.token),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            formcapnhat.giayChungNhan = data.path;
            saveData(formcapnhat);
          })
          .catch(() => {
            Helpers.alertError(`Tải file hình ảnh không thành công!`);
          });
      } else {
        saveData(formcapnhat);
      }
    } else {
      Helpers.alertError(`Vui lòng tải file cập nhật kết quả đào tạo!`);
    }
  };

  const saveData = (formcapnhat) => {
    if (DataChiTiet && DataChiTiet.giayChungNhan) {
      const newData = {
        ...formcapnhat,
        vptq_lms_KetQuaDaoTao_Id:
          DataChiTiet && DataChiTiet.vptq_lms_KetQuaDaoTao_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_HocTrucTuyen/ket-qua-dao-tao/${DataChiTiet.vptq_lms_KetQuaDaoTao_Id}`,
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
            handleRefesh();
            getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword);
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    } else {
      const newData = {
        ...formcapnhat,
        vptq_lms_LopHocChiTiet_Id:
          DataChiTiet && DataChiTiet.vptq_lms_LopHocChiTiet_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `vptq_lms_HocTrucTuyen/ket-qua-dao-tao/${DataChiTiet.vptq_lms_LopHocChiTiet_Id}`,
            "POST",
            newData,
            "XACNHAN",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            handleRefesh();
            getListData(KienThuc, ChuyenDeDaoTao, LopHoc, keyword);
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleRefesh = () => {
    setActiveModalCapNhat(false);
    setDataChiTiet(null);
    setGiayChungNhan(null);
    setDisableUploadGiayChungNhan(false);
    setListDonViDaoTao([]);
    resetFields();
    setFieldTouch(false);
  };

  const handleViewFile = (file) => {
    if (file) {
      window.open(URL.createObjectURL(file), "_blank");
    }
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Cập nhật kết quả đào tạo"}
        description="Danh sách đào tạo"
        buttons={addButtonRender()}
      />
      {IsAdmin && (
        <Card className="th-card-margin-bottom">
          <Row>
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span>Kiến thức:</span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListKienThuc ? ListKienThuc : []}
                placeholder="Chọn kiến thức"
                optionsvalue={["vptq_lms_KienThuc_Id", "tenKienThuc"]}
                style={{ width: "100%" }}
                value={KienThuc}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectKienThuc}
                allowClear
                onClear={handleClearKienThuc}
              />
            </Col>
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span>Chuyên đề đào tạo:</span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListChuyenDeDaoTao ? ListChuyenDeDaoTao : []}
                placeholder="Chọn chuyên đề đào tạo"
                optionsvalue={[
                  "vptq_lms_ChuyenDeDaoTao_Id",
                  "tenChuyenDeDaoTao",
                ]}
                style={{ width: "100%" }}
                value={ChuyenDeDaoTao}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectChuyenDeDaoTao}
                allowClear
                onClear={handleClearChuyenDeDaoTao}
              />
            </Col>
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span>Lớp học:</span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListLopHoc ? ListLopHoc : []}
                placeholder="Chọn lớp học"
                optionsvalue={["vptq_lms_LopHoc_Id", "tenLopHoc"]}
                style={{ width: "100%" }}
                value={LopHoc}
                showSearch
                optionFilterProp={"name"}
                onSelect={handleOnSelectLopHoc}
                allowClear
                onClear={handleClearLopHoc}
              />
            </Col>
            <Col
              xxl={6}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{ marginBottom: 8 }}
            >
              <span>Tìm kiếm:</span>
              <Toolbar
                count={1}
                search={{
                  title: "Tìm kiếm",
                  loading,
                  value: keyword,
                  onChange: onChangeKeyword,
                  onPressEnter: onSearchCapNhat,
                  onSearch: onSearchCapNhat,
                  placeholder: "Nhập từ khóa",
                  allowClear: true,
                }}
              />
            </Col>
          </Row>
        </Card>
      )}
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1700, y: "48vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
        />
      </Card>
      <AntModal
        title={"Cập nhật giấy chứng nhận kết quả đào tạo"}
        className="th-card-reset-margin"
        open={ActiveModalCapNhat}
        width={width >= 1600 ? `70%` : width >= 1200 ? `85%` : "100%"}
        closable={true}
        onCancel={() => handleRefesh()}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row gutter={[0, 10]}>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "110px",
                  fontWeight: "bold",
                }}
              >
                Mã nhân viên:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 110px)",
                  }}
                >
                  {DataChiTiet.maNhanVien}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "80px",
                  fontWeight: "bold",
                }}
              >
                Họ và tên:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 80px)",
                  }}
                >
                  {DataChiTiet.fullName}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "60px",
                  fontWeight: "bold",
                }}
              >
                Đơn vị:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 60px)",
                  }}
                >
                  {DataChiTiet.tenDonVi}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "145px",
                  fontWeight: "bold",
                }}
              >
                Chuyên đề đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 145px)",
                  }}
                >
                  {DataChiTiet.tenChuyenDeDaoTao}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "70px",
                  fontWeight: "bold",
                }}
              >
                Lớp học:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 70px)",
                  }}
                >
                  {DataChiTiet.tenLopHoc}
                </span>
              )}
            </Col>
            <Col
              xxl={8}
              xl={8}
              lg={12}
              md={12}
              sm={24}
              xs={24}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Hình thức đào tạo:
              </span>
              {DataChiTiet && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
                  }}
                >
                  {DataChiTiet.tenHinhThucDaoTao}
                </span>
              )}
            </Col>
          </Row>
        </Card>

        <Form
          {...DEFAULT_FORM_ADD_2COL_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card
            className="th-card-margin-bottom th-card-reset-margin"
            title={"Cập nhật kết quả đào tạo"}
          >
            <Row
              align={width >= 1600 ? "" : "center"}
              style={{ width: "100%" }}
            >
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{
                  padding: "0px 30px",
                  marginBottom: "5px",
                }}
              >
                <FormItem
                  label="Đơn vị đào tạo"
                  name={["formcapnhat", "vptq_lms_DonViDaoTao_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListDonViDaoTao ? ListDonViDaoTao : []}
                    placeholder="Chọn đơn vị đào tạo"
                    optionsvalue={["id", "tenDonViDaoTao"]}
                    style={{ width: "100%" }}
                    optionFilterProp="name"
                    showSearch
                    disabled={
                      DataChiTiet &&
                      DataChiTiet.vptq_lms_HinhThucDaoTao_Id.toLowerCase() ===
                        HINHTHUCDAOTAO_TAPTRUNG
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
                style={{
                  marginBottom: "5px",
                  padding: "0px 30px",
                }}
              >
                <FormItem
                  label="Hình ảnh"
                  name={["formcapnhat", "giayChungNhan"]}
                  rules={[
                    {
                      required: true,
                      type: "file",
                    },
                  ]}
                >
                  {!DisableUploadGiayChungNhan ? (
                    <Upload {...props}>
                      <Button
                        className="th-margin-bottom-0"
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                      >
                        Tải file hình ảnh
                      </Button>
                    </Upload>
                  ) : GiayChungNhan && GiayChungNhan.name ? (
                    <span>
                      <span
                        style={{
                          color: "#0469B9",
                          cursor: "pointer",
                          whiteSpace: "break-spaces",
                        }}
                        onClick={() => handleViewFile(GiayChungNhan)}
                      >
                        {GiayChungNhan.name}{" "}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setGiayChungNhan(null);
                          setDisableUploadGiayChungNhan(false);
                          setFieldsValue({
                            formcapnhat: {
                              giayChungNhan: null,
                            },
                          });
                        }}
                      />
                    </span>
                  ) : (
                    <span>
                      <a
                        target="_blank"
                        href={BASE_URL_API + GiayChungNhan}
                        rel="noopener noreferrer"
                        style={{
                          whiteSpace: "break-spaces",
                          wordBreak: "break-all",
                        }}
                      >
                        {GiayChungNhan && GiayChungNhan.split("/")[5]}{" "}
                      </a>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setGiayChungNhan(null);
                          setDisableUploadGiayChungNhan(false);
                          setFieldsValue({
                            formcapnhat: {
                              giayChungNhan: null,
                            },
                          });
                        }}
                      />
                    </span>
                  )}
                </FormItem>
              </Col>
              <Col
                span={24}
                style={{
                  marginBottom: "5px",
                  padding: "0px 30px",
                }}
              >
                <FormItem
                  label="Ghi chú"
                  name={["formcapnhat", "moTa"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <TextArea
                    rows={2}
                    className="input-item"
                    placeholder="Nhập ghi chú"
                  />
                </FormItem>
              </Col>
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Divider />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  icon={<CloseCircleOutlined />}
                  className="th-margin-bottom-0"
                  onClick={() => handleRefesh()}
                >
                  Đóng
                </Button>
                <Button
                  icon={<SaveOutlined />}
                  className="th-margin-bottom-0"
                  type="primary"
                  htmlType={"submit"}
                  disabled={!fieldTouch}
                >
                  Cập nhật
                </Button>
              </div>
            </div>
          </Card>
        </Form>
      </AntModal>
    </div>
  );
}

export default CapNhatKetQuaDaoTao;
