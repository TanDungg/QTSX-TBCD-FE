import { Button, Card, Col, Divider, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { removeDuplicates, reDataForTable } from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { EditableRow, EditableCell } = EditableTableRow;

function KhachHang({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListLoaiKhachHang, setListLoaiKhachHang] = useState([]);
  const [LoaiKhachHang, setLoaiKhachHang] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const { totalRow, pageSize } = Data;

  useEffect(() => {
    if (permission && permission.view) {
      getListLoaiKhachHang();
      getListData(LoaiKhachHang, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (tsec_qtsx_LoaiKhachHang_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      tsec_qtsx_LoaiKhachHang_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_KhachHang?${param}`,
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

  const getListLoaiKhachHang = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_LoaiKhachHang?page=-1`,
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
          setListLoaiKhachHang(res.data);
        } else {
          setListLoaiKhachHang([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(LoaiKhachHang, keyword, pagination);
  };

  const onSearchKhachHang = () => {
    getListData(LoaiKhachHang, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(LoaiKhachHang, val.target.value, page);
    }
  };

  const deleteItemFunc = (item) => {
    const title = "khách hàng";
    ModalDeleteConfirm(deleteItemAction, item, item.tenKhachHang, title);
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_KhachHang/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(LoaiKhachHang, keyword, page);
      })
      .catch((error) => console.error(error));
  };

  const actionContent = (item) => {
    const editItem =
      permission && permission.edit ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Sửa"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Sửa">
          <EditOutlined />
        </span>
      );
    const deleteItemVal =
      permission && permission.del
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let dataList = reDataForTable(Data.datalist);

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
      title: "Mã khách hàng",
      dataIndex: "maKhachHang",
      key: "maKhachHang",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maKhachHang,
            value: d.maKhachHang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maKhachHang && record.maKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "tenKhachHang",
      key: "tenKhachHang",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenKhachHang,
            value: d.tenKhachHang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenKhachHang && record.tenKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Người liên hệ",
      dataIndex: "nguoiLienHe",
      key: "nguoiLienHe",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.nguoiLienHe,
            value: d.nguoiLienHe,
          };
        })
      ),
      onFilter: (value, record) =>
        record.nguoiLienHe && record.nguoiLienHe.includes(value),
      filterSearch: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.diaChi,
            value: d.diaChi,
          };
        })
      ),
      onFilter: (value, record) =>
        record.diaChi && record.diaChi.includes(value),
      filterSearch: true,
    },
    {
      title: "Điện thoại",
      dataIndex: "sdt",
      key: "sdt",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.sdt,
            value: d.sdt,
          };
        })
      ),
      onFilter: (value, record) => record.sdt && record.sdt.includes(value),
      filterSearch: true,
    },
    {
      title: "Fax",
      dataIndex: "fax",
      key: "fax",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.fax,
            value: d.fax,
          };
        })
      ),
      onFilter: (value, record) => record.fax && record.fax.includes(value),
      filterSearch: true,
    },
    {
      title: "Quốc gia",
      dataIndex: "tenQuocGia",
      key: "tenQuocGia",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenQuocGia,
            value: d.tenQuocGia,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenQuocGia && record.tenQuocGia.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại khách hàng",
      dataIndex: "tenLoaiKhachHang",
      key: "tenLoaiKhachHang",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiKhachHang,
            value: d.tenLoaiKhachHang,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenLoaiKhachHang && record.tenLoaiKhachHang.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.moTa,
            value: d.moTa,
          };
        })
      ),
      onFilter: (value, record) => record.moTa && record.moTa.includes(value),
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
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={handleRedirect}
          disabled={permission && !permission.add}
        >
          Thêm mới
        </Button>
      </>
    );
  };

  const handleOnSelectLoaiKhachHang = (value) => {
    setLoaiKhachHang(value);
    getListData(value, keyword, page);
  };

  const handleClearLoaiKhachHang = () => {
    setLoaiKhachHang(null);
    getListData(null, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục khách hàng"}
        description="Danh sách khách hàng"
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
            style={{ marginBottom: "10px" }}
          >
            <span>Loại khách hàng:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiKhachHang ? ListLoaiKhachHang : []}
              placeholder="Chọn loại khách hàng"
              optionsvalue={["id", "tenLoaiKhachHang"]}
              style={{ width: "100%" }}
              value={LoaiKhachHang}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectLoaiKhachHang}
              allowClear
              onClear={handleClearLoaiKhachHang}
            />
          </Col>
          <Col
            xxl={8}
            xl={12}
            lg={16}
            md={16}
            sm={20}
            xs={24}
            style={{
              marginBottom: "10px",
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>Tìm kiếm:</span>
            <Toolbar
              count={1}
              search={{
                title: "Tìm kiếm",
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchKhachHang,
                onSearch: onSearchKhachHang,
                placeholder: "Nhập từ khóa",
                allowClear: true,
              }}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1500, y: "55vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default KhachHang;
