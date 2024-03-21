import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
<<<<<<< HEAD
import { Link } from "react-router-dom";
import {
  removeDuplicates,
} from "src/util/Common";
=======
import { removeDuplicates } from "src/util/Common";
>>>>>>> d291619156091d9f07f2f31cf874d58d2639e49a
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  Table,
  Toolbar,
  Select,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import ImportPhongBanHRM from "./ImportPhongBanHRM";

const { EditableRow, EditableCell } = EditableTableRow;

function PhongBanHRM({ match, permission, history }) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [keyword, setKeyword] = useState("");
  const [donViHRM_Id, setDonViHRM_Id] = useState("");
  const [donVi_Id, setDonVi_Id] = useState("");
  const [ActiveModal, setActiveModal] = useState(false);
  const [ListDonVi, setListDonVi] = useState([]);
  const [ListDonViHRM, setListDonViHRM] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getDonVi();
      getDonViHRM();
      getListData(keyword, donViHRM_Id, donVi_Id);
    } else if (permission && permission.view === false) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param
   */
  const getListData = (maPhongBanHRM, donViHRM_Id, donVi_Id) => {
    let param = convertObjectToUrlParams({
      maPhongBanHRM,
      donViHRM_Id,
      donVi_Id,
    });
    dispatch(fetchStart(`PhongbanHRM?${param}`, "GET", null, "LIST"));
  };
  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("DonVi?page=-1", "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          setListDonVi(res.data);
        } else {
          setListDonVi([]);
        }
      })
      .catch((error) => console.error(error));
  };
  const getDonViHRM = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBanHRM/list-don-vi-hrm`,
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
        if (res && res.status === 200) {
          setListDonViHRM(res.data);
        } else {
          setListDonViHRM([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(keyword);
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(val.target.value);
    }
  };

  let dataList = reDataForTable(data);

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã Ban/Phòng",
      dataIndex: "maPhongBanHRM",
      key: "maPhongBanHRM",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maPhongBanHRM,
            value: d.maPhongBanHRM,
          };
        })
      ),
      onFilter: (value, record) => record.maPhongBanHRM.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên Ban/Phòng",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      align: "center",
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
      align: "center",
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
    {
      title: "Mã Đơn vị Đào tạo",
      dataIndex: "maDonVi",
      align: "center",
      key: "maDonVi",
    },
    {
      title: "Cấp 1",
      dataIndex: "tenCapDoPhongBanBoPhanLevel1",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel1",
    },
    {
      title: "Cấp 2",
      dataIndex: "tenCapDoPhongBanBoPhanLevel2",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel2",
    },
    {
      title: "Cấp 3",
      dataIndex: "tenCapDoPhongBanBoPhanLevel3",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel3",
    },
    {
      title: "Cấp 4",
      dataIndex: "tenCapDoPhongBanBoPhanLevel4",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel4",
    },
    {
      title: "Cấp 5",
      dataIndex: "tenCapDoPhongBanBoPhanLevel5",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel5",
    },
    {
      title: "Cấp 6",
      dataIndex: "tenCapDoPhongBanBoPhanLevel6",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel6",
    },
    {
      title: "Cấp 7",
      dataIndex: "tenCapDoPhongBanBoPhanLevel7",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel7",
    },
    {
      title: "Cấp 8",
      dataIndex: "tenCapDoPhongBanBoPhanLevel8",
      align: "center",
      key: "tenCapDoPhongBanBoPhanLevel8",
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

  const handleImport = () => {
    setActiveModal(true);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<UploadOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
      </>
    );
  };
  const handleOnSelectDonVi = (value) => {
    if (donVi_Id !== value) {
      setDonViHRM_Id();
      setDonVi_Id(value);
      getListData(keyword, null, value);
    }
  };
  const handleClearDonVi = () => {
    setDonVi_Id();
    getListData(keyword, null, null);
  };
  const handleOnSelectDonViHRM = (value) => {
    if (donViHRM_Id !== value) {
      getListData(keyword, value);
      setDonVi_Id();
      setDonViHRM_Id(value);
    }
  };
  const handleClearDonViHRM = () => {
    setDonViHRM_Id();
    getListData(keyword, null);
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục Ban/Phòng HRM"}
        description="Danh sách Ban/Phòng HRM"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom ">
        <Row>
          <Col
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Đơn vị</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonVi ? ListDonVi : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["id", "tenDonVi"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectDonVi}
              value={donVi_Id}
              allowClear
              onClear={handleClearDonVi}
              optionFilterProp={"name"}
              showSearch
            />
          </Col>
          <Col
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Đơn vị HRM</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonViHRM ? ListDonViHRM : []}
              placeholder="Chọn đơn vị HRM"
              optionsvalue={["id", "tenDonViHRM"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectDonViHRM}
              value={donViHRM_Id}
              allowClear
              onClear={handleClearDonViHRM}
              optionFilterProp={"name"}
              showSearch
            />
          </Col>
          <Col xl={8} lg={12} md={12} sm={24} xs={24}>
            <h5>Tìm kiếm </h5>
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
            />{" "}
          </Col>
        </Row>
      </Card>
      <Card
        className="th-card-margin-bottom th-card-reset-margin"
        bodyStyle={{ paddingBottom: 0 }}
      >
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1400, y: "59vh" }}
          components={components}
          className="gx-table-responsive gx-table-resize"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            pageSize: 30,
            total: dataList.length,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
        <ImportPhongBanHRM
          openModal={ActiveModal}
          openModalFS={setActiveModal}
          refresh={() => getListData(keyword)}
        />
      </Card>
    </div>
  );
}

export default PhongBanHRM;
