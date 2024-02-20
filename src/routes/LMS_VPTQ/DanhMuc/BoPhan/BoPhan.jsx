import { Card, Col, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
  removeDuplicates,
  reDataForTable,
  treeToFlatlist,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function BoPhan({ permission, history }) {
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListDonVi, setListDonVi] = useState([]);
  const [DonVi, setDonVi] = useState(null);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [PhongBan, setPhongBan] = useState(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getListDonVi();
      getListData(INFO.donVi_Id);
      getListPhongBan(INFO.donVi_Id);
      setDonVi(INFO.donVi_Id.toLowerCase());
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (donviid, phongBan_Id, keyword) => {
    const param = convertObjectToUrlParams({ donviid, phongBan_Id, keyword });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `BoPhan/bo-phan-tree?${param}`,
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

  const getListPhongBan = (donviid) => {
    let param = convertObjectToUrlParams({
      donviid,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Phongban?${param}`,
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
        setListPhongBan(res.data);
      } else {
        setListPhongBan([]);
      }
    });
  };

  const onSearchNguoiDung = () => {
    getListData(DonVi, PhongBan, keyword);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(DonVi, PhongBan, val.target.value);
    }
  };

  const dataList = reDataForTable(treeToFlatlist(Data));

  let colValues = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 50,
      align: "center",
    },
    {
      title: "Mã bộ phận",
      dataIndex: "maBoPhan",
      key: "maBoPhan",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maBoPhan,
            value: d.maBoPhan,
          };
        })
      ),
      onFilter: (value, record) => record.maBoPhan.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên bộ phận",
      dataIndex: "tenBoPhan",
      key: "tenBoPhan",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenBoPhan,
            value: d.tenBoPhan,
          };
        })
      ),
      onFilter: (value, record) => record.tenBoPhan.includes(value),
      filterSearch: true,
    },
    {
      title: "Ban/Phòng",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      align: "left",
      width: 300,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonVi,
            value: d.tenDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonVi.includes(value),
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

  const handleOnSelectDonVi = (value) => {
    setDonVi(value);
    setPhongBan(null);
    getListPhongBan(value);
    getListData(value, null, keyword);
  };

  const handleOnSelectPhongBan = (value) => {
    setPhongBan(value);
    getListData(DonVi, value, keyword);
  };

  const handleOnClearPhongBan = (value) => {
    setPhongBan(null);
    getListData(DonVi, null, keyword);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục bộ phận"}
        description="Danh sách bộ phận"
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
            style={{ marginBottom: 8 }}
          >
            <span>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonVi ? ListDonVi : []}
              placeholder="Chọn đơn vị đào tạo"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              value={DonVi}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDonVi}
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
              placeholder="Chọn đơn vị đào tạo"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              value={PhongBan}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectPhongBan}
              allowClear
              onClear={handleOnClearPhongBan}
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
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
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
          scroll={{ x: 800, y: "50vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default BoPhan;
