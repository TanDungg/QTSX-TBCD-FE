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

function CongViec({ history, permission, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListLoaiThongTin, setListLoaiThongTin] = useState([]);
  const [LoaiThongTin, setLoaiThongTin] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const { totalRow, pageSize } = Data;

  useEffect(() => {
    if (permission && permission.view) {
      getListLoaiThongTin();
      getListData(LoaiThongTin, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
  }, []);

  const getListData = (tsec_qtsx_LoaiThongTin_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      tsec_qtsx_LoaiThongTin_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_CongViec?${param}`,
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

  const getListLoaiThongTin = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tsec_qtsx_LoaiThongTin`,
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
          setListLoaiThongTin(res.data);
        } else {
          setListLoaiThongTin([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(LoaiThongTin, keyword, pagination);
  };

  const onSearchCongViec = () => {
    getListData(LoaiThongTin, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(LoaiThongTin, val.target.value, page);
    }
  };

  const deleteItemFunc = (item) => {
    const title = "hạng mục công việc";
    ModalDeleteConfirm(deleteItemAction, item, item.tenCongViec, title);
  };

  const deleteItemAction = (item) => {
    let url = `tsec_qtsx_CongViec/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(LoaiThongTin, keyword, page);
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
      width: 100,
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
      title: "Mã hạng mục công việc",
      dataIndex: "maCongViec",
      key: "maCongViec",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maCongViec,
            value: d.maCongViec,
          };
        })
      ),
      onFilter: (value, record) =>
        record.maCongViec && record.maCongViec.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung công việc",
      dataIndex: "noiDungCongViec",
      key: "noiDungCongViec",
      align: "left",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.noiDungCongViec,
            value: d.noiDungCongViec,
          };
        })
      ),
      onFilter: (value, record) =>
        record.noiDungCongViec && record.noiDungCongViec.includes(value),
      filterSearch: true,
    },
    {
      title: "Loại thông tin",
      dataIndex: "tenLoaiThongTin",
      key: "tenLoaiThongTin",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLoaiThongTin,
            value: d.tenLoaiThongTin,
          };
        })
      ),
      onFilter: (value, record) =>
        record.tenLoaiThongTin && record.tenLoaiThongTin.includes(value),
      filterSearch: true,
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 200,
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

  const handleOnSelectLoaiThongTin = (value) => {
    setLoaiThongTin(value);
    getListData(value, keyword, page);
  };

  const handleClearLoaiThongTin = () => {
    setLoaiThongTin(null);
    getListData(null, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục hạng mục công việc"}
        description="Danh sách hạng mục công việc"
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
            <span>Loại thông tin:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiThongTin ? ListLoaiThongTin : []}
              placeholder="Chọn loại thông tin"
              optionsvalue={["id", "tenLoaiThongTin"]}
              style={{ width: "100%" }}
              value={LoaiThongTin}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectLoaiThongTin}
              allowClear
              onClear={handleClearLoaiThongTin}
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
                onPressEnter: onSearchCongViec,
                onSearch: onSearchCongViec,
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
          scroll={{ x: 1000, y: "55vh" }}
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

export default CongViec;