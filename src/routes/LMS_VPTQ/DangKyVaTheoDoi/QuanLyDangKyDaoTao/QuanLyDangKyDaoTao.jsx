import { Button, Card, Col, DatePicker, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  removeDuplicates,
  reDataForTable,
  getNgayDauThang,
  getNgayCuoiThang,
} from "src/util/Common";
import {
  EditableTableRow,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import ModalTaoLopHoc from "./ModalTaoLopHoc";
import ModalHuyDangKy from "./ModalHuyDangKy";

const { EditableRow, EditableCell } = EditableTableRow;
const { RangePicker } = DatePicker;

function QuanLyDangKyDaoTao({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [ListChuyenDe, setListChuyenDe] = useState([]);
  const [TuNgay, setTuNgay] = useState(getNgayDauThang());
  const [DenNgay, setDenNgay] = useState(getNgayCuoiThang());
  const [ChuyenDe, setChuyenDe] = useState(null);
  const [SelectedCBNV, setSelectedCBNV] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [DataTaoLopHoc, setDataTaoLopHoc] = useState(null);
  const [ActiveModalTaoLopHoc, setActiveModalTaoLopHoc] = useState(false);
  const [HocVien, setHocVien] = useState(null);
  const [ActiveModalHuyDangKy, setActiveModalHuyDangKy] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListChuyenDe(TuNgay, DenNgay);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (
    vptq_lms_ChuyenDeDaoTao_Id,
    tuNgay,
    denNgay,
    keyword
  ) => {
    let param = convertObjectToUrlParams({
      vptq_lms_ChuyenDeDaoTao_Id,
      tuNgay,
      denNgay,
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/danh-sach-tao-lop-hoc?${param}`,
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

  const getListChuyenDe = (tuNgay, denNgay) => {
    let param = convertObjectToUrlParams({
      tuNgay,
      denNgay,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/danh-sach-chuyen-de-tao-lop-hoc?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data.length) {
        const newData = res.data.map((data) => {
          return {
            ...data,
            chuyenDe: `${data.tenChuyenDeDaoTao} (${data.tenHinhThucDaoTao})`,
          };
        });
        setListChuyenDe(newData);
        setChuyenDe(res.data[0].vptq_lms_ChuyenDeDaoTao_Id);
        getListData(
          res.data[0].vptq_lms_ChuyenDeDaoTao_Id,
          tuNgay,
          denNgay,
          keyword
        );
      } else {
        setData([]);
      }
    });
  };

  const onSearchNguoiDung = () => {
    getListData(ChuyenDe, TuNgay, DenNgay, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(ChuyenDe, TuNgay, DenNgay, val.target.value);
    }
  };

  const handleClearSearch = () => {
    getListData(ChuyenDe, TuNgay, DenNgay, null);
  };

  const actionContent = (item) => {
    const huy = {
      onClick: () => {
        setActiveModalHuyDangKy(true);
        setHocVien(item);
      },
    };

    return (
      <React.Fragment>
        <a
          {...huy}
          title="Hủy đăng ký"
          style={{ color: "red", fontSize: "15px" }}
        >
          <CloseCircleOutlined />
        </a>
      </React.Fragment>
    );
  };

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
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      width: 250,
      filters: removeDuplicates(
        map(Data, (d) => {
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
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonVi.includes(value),
      filterSearch: true,
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenPhongBan,
            value: d.tenPhongBan,
          };
        })
      ),
      onFilter: (value, record) => record.tenPhongBan.includes(value),
      filterSearch: true,
    },
    {
      title: "Thời gian đăng ký",
      dataIndex: "thoiGianDangKy",
      key: "thoiGianDangKy",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.thoiGianDangKy,
            value: d.thoiGianDangKy,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianDangKy.includes(value),
      filterSearch: true,
    },
    {
      title: "Người đăng ký",
      dataIndex: "tenNguoiDangKy",
      key: "tenNguoiDangKy",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenNguoiDangKy,
            value: d.tenNguoiDangKy,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiDangKy.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 100,
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

  const handleTaoLopHoc = () => {
    const chuyende = ListChuyenDe.find(
      (cd) => cd.vptq_lms_ChuyenDeDaoTao_Id === ChuyenDe
    );
    const newData = {
      ...chuyende,
      list_ChiTiets: SelectedCBNV,
    };
    setDataTaoLopHoc(newData);
    setActiveModalTaoLopHoc(true);
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<PlusOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleTaoLopHoc}
          disabled={!SelectedCBNV.length}
        >
          Tạo lớp học
        </Button>
      </>
    );
  };

  const handleOnSelectChuyenDe = (value) => {
    setChuyenDe(value);
    setSelectedCBNV([]);
    setSelectedKeys([]);
    getListData(value, TuNgay, DenNgay, keyword);
  };

  const handleChangeNgay = (dateString) => {
    setTuNgay(dateString[0]);
    setDenNgay(dateString[1]);
    setListChuyenDe([]);
    setSelectedCBNV([]);
    setSelectedKeys([]);
    setChuyenDe(null);
    getListChuyenDe(dateString[0], dateString[1]);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedCBNV,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedCBNV = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedCBNV(newSelectedCBNV);
      setSelectedKeys(newSelectedKeys);
    },
  };

  const handleRefesh = () => {
    getListChuyenDe(TuNgay, DenNgay);
    setSelectedCBNV([]);
    setSelectedKeys([]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Quản lý đăng ký đào tạo"}
        description="Danh sách quản lý đăng ký đào tạo"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: "5px" }}
          >
            <span>Chuyên đề:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDe ? ListChuyenDe : []}
              placeholder="Chọn chuyên đề"
              optionsvalue={["vptq_lms_ChuyenDeDaoTao_Id", "chuyenDe"]}
              style={{ width: "100%" }}
              value={ChuyenDe}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectChuyenDe}
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
            <span>Ngày dự kiến đào tạo:</span>
            <RangePicker
              format={"DD/MM/YYYY"}
              style={{ width: "90%" }}
              onChange={(date, dateString) => handleChangeNgay(dateString)}
              defaultValue={[
                moment(TuNgay, "DD/MM/YYYY"),
                moment(DenNgay, "DD/MM/YYYY"),
              ]}
              allowClear={false}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: "5px" }}
          >
            <span>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
                placeholder: "Nhập từ khóa",
                allowClear: true,
                onClear: { handleClearSearch },
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1400, y: "50vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(Data)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
          }}
        />
      </Card>
      <ModalTaoLopHoc
        openModal={ActiveModalTaoLopHoc}
        openModalFS={setActiveModalTaoLopHoc}
        dataTaoLopHoc={DataTaoLopHoc}
        refesh={handleRefesh}
      />
      <ModalHuyDangKy
        openModal={ActiveModalHuyDangKy}
        openModalFS={setActiveModalHuyDangKy}
        refesh={handleRefesh}
        hocvien={HocVien}
      />
    </div>
  );
}

export default QuanLyDangKyDaoTao;
