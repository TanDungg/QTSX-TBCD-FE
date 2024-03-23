import { Button, Card, Col, DatePicker, Row, Tag } from "antd";
import { CloseCircleOutlined, RetweetOutlined } from "@ant-design/icons";
import { map, find, remove, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  removeDuplicates,
  reDataForTable,
  getNamNow,
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import {
  EditableTableRow,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import moment from "moment";
import ModalHuyDaoTao from "./ModalHuyDaoTao";
import ModalChuyenDaoTao from "./ModalChuyenDaoTao";

const { EditableRow, EditableCell } = EditableTableRow;

function TheoDoiDaoTao({ history, permission, match }) {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListChuyenDe, setListChuyenDe] = useState([]);
  const [ChuyenDe, setChuyenDe] = useState(null);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [PhongBan, setPhongBan] = useState(null);
  const [Nam, setNam] = useState(getNamNow());
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [SelectedNhanVien, setSelectedNhanVien] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [ActiveModalChuyenDaoTao, setActiveModalChuyenDaoTao] = useState(false);
  const [ActiveModalHuyDaoTao, setActiveModalHuyDaoTao] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListChuyenDe();
      getListDonVi();
      getListData(ChuyenDe, DonVi, PhongBan, Nam, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (
    vptq_lms_ChuyenDeDaoTao_Id,
    donVi_Id,
    phongBan_Id,
    nam,
    keyword,
    page
  ) => {
    let param = convertObjectToUrlParams({
      donViHienHanh_Id: INFO.donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
      donVi_Id,
      phongBan_Id,
      nam,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TheoDoiDaoTao?${param}`,
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

  const getListChuyenDe = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_ChuyenDeDaoTao?page=-1`,
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
        const newData = res.data
          .filter((dt) => dt.isSuDung === true)
          .map((data) => {
            return {
              ...data,
              chuyenDe: `${data.tenChuyenDeDaoTao} (${data.tenHinhThucDaoTao})`,
            };
          });
        setListChuyenDe(newData);
      } else {
        setData([]);
      }
    });
  };

  const getListDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi/don-vi-by-user`,
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
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListPhongBan = (donVi_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan/phong-ban-tree?donviid=${donVi_Id}`,
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
          setListPhongBan(res.data);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(ChuyenDe, DonVi, PhongBan, Nam, keyword, pagination);
  };

  const onSearchNguoiDung = () => {
    getListData(ChuyenDe, DonVi, PhongBan, Nam, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(ChuyenDe, DonVi, PhongBan, Nam, val.target.value, page);
    }
  };

  const { totalRow, pageSize } = Data;
  const dataList = reDataForTable(Data.datalist, page, pageSize);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: "left",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 120,
      fixed: "left",
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
      width: 180,
      fixed: "left",
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
      width: 250,
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
      title: "Lớp đào tạo",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 200,
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
      title: "Người đăng ký",
      dataIndex: "tenNguoiTao",
      key: "tenNguoiTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiTao,
            value: d.tenNguoiTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 170,
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
      title: "Địa điểm",
      dataIndex: "diaDiem",
      key: "diaDiem",
      align: "left",
      width: 180,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.diaDiem,
            value: d.diaDiem,
          };
        })
      ),
      onFilter: (value, record) => record.diaDiem.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 120,
      fixed: width >= 1200 && "right",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.trangThai,
            value: d.trangThai,
          };
        })
      ),
      onFilter: (value, record) => record.trangThai.includes(value),
      filterSearch: true,
      render: (value, record) => (
        <div title={record.lyDoHuy && `Lý do hủy: ${record.lyDoHuy}`}>
          {value && (
            <Tag
              color={
                value === "Hủy đào tạo" || value === "Không học"
                  ? "red"
                  : value === "Hoàn thành"
                  ? "blue"
                  : value === "Chưa học"
                  ? ""
                  : "orange"
              }
              style={{
                whiteSpace: "break-spaces",
                fontSize: 13,
              }}
            >
              {value}
            </Tag>
          )}
        </div>
      ),
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

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<RetweetOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={() => setActiveModalChuyenDaoTao(true)}
          disabled={!SelectedNhanVien.length}
        >
          Chuyển đào tạo
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="danger"
          onClick={() => setActiveModalHuyDaoTao(true)}
          disabled={!SelectedNhanVien.length}
        >
          Hủy đào tạo
        </Button>
      </>
    );
  };

  const handleOnSelectChuyenDe = (value) => {
    setChuyenDe(value);
    getListData(value, DonVi, PhongBan, Nam, keyword, page);
  };

  const handleClearChuyenDe = () => {
    setChuyenDe(null);
    getListData(null, DonVi, PhongBan, Nam, keyword, page);
  };

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    setPhongBan(null);
    getListPhongBan(value);
    getListData(ChuyenDe, value, null, Nam, keyword, page);
  };

  const handleClearDonVi = () => {
    setDonVi(null);
    setPhongBan(null);
    setListPhongBan([]);
    getListData(ChuyenDe, null, null, Nam, keyword, page);
  };

  const handleOnSelectPhongBan = (value) => {
    setPhongBan(value);
    getListData(ChuyenDe, DonVi, value, Nam, keyword, page);
  };

  const handleClearPhongBan = () => {
    setPhongBan(null);
    getListData(ChuyenDe, DonVi, null, Nam, keyword, page);
  };

  const handleChangeNam = (date, year) => {
    setNam(year);
    getListData(ChuyenDe, DonVi, PhongBan, year, keyword, page);
  };

  function hanldeRemoveSelected(device) {
    const newDevice = remove(SelectedNhanVien, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(SelectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectedNhanVien(newDevice);
    setSelectedKeys(newKeys);
  }

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedNhanVien,
    onChange: (selectedRowKeys, selectedRows) => {
      const row =
        SelectedNhanVien.length > 0
          ? selectedRows.filter((d) => d.key !== SelectedNhanVien[0].key)
          : [...selectedRows];
      const key = row.map((r) => {
        return r.key;
      });
      if (row.length && row[0].trangThai === "Chưa học") {
        setSelectedNhanVien(row);
        setSelectedKeys(key);
      } else {
        setSelectedNhanVien([]);
        setSelectedKeys([]);
      }
    },
  };

  const handleRefesh = () => {
    getListData(ChuyenDe, DonVi, PhongBan, Nam, keyword, page);
    setSelectedNhanVien([]);
    setSelectedKeys([]);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Theo dõi đào tạo"}
        description="Danh sách theo dõi đào tạo"
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
              optionsvalue={["id", "chuyenDe"]}
              style={{ width: "100%" }}
              value={ChuyenDe}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectChuyenDe}
              allowClear
              onClear={handleClearChuyenDe}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonVi ? ListDonVi : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["donVi_Id", "tenDonVi"]}
              style={{ width: "100%" }}
              value={DonVi}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDonVi}
              allowClear
              onClear={handleClearDonVi}
            />
          </Col>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Phòng ban:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListPhongBan ? ListPhongBan : []}
              placeholder="Chọn phòng ban"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectPhongBan}
              allowClear
              onClear={handleClearPhongBan}
              value={PhongBan}
            />
          </Col>
          <Col
            xxl={8}
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
              }}
            />
          </Col>
          <Col
            xxl={3}
            xl={4}
            lg={5}
            md={5}
            sm={6}
            xs={8}
            style={{ marginBottom: 8 }}
          >
            <span>Năm:</span>
            <DatePicker
              format={"YYYY"}
              picker="year"
              style={{ width: "90%" }}
              onChange={handleChangeNam}
              defaultValue={moment(Nam, "YYYY")}
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1750, y: "42vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            hideSelectAll: true,
            preserveSelectedRowKeys: true,
            SelectedRowKeys: SelectedKeys,
          }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (e) => {
                const nhanvien = find(SelectedKeys, (k) => k === record.key);
                if (!nhanvien) {
                  if (record.trangThai === "Chưa học") {
                    setSelectedNhanVien([record]);
                    setSelectedKeys([record.key]);
                  } else {
                    setSelectedNhanVien([]);
                    setSelectedKeys([]);
                  }
                } else {
                  hanldeRemoveSelected(record);
                }
              },
            };
          }}
        />
      </Card>
      <ModalChuyenDaoTao
        openModal={ActiveModalChuyenDaoTao}
        openModalFS={setActiveModalChuyenDaoTao}
        hocvien={SelectedNhanVien && SelectedNhanVien[0]}
        refesh={handleRefesh}
      />
      <ModalHuyDaoTao
        openModal={ActiveModalHuyDaoTao}
        openModalFS={setActiveModalHuyDaoTao}
        hocvien={SelectedNhanVien && SelectedNhanVien[0]}
        refesh={handleRefesh}
      />
    </div>
  );
}

export default TheoDoiDaoTao;
