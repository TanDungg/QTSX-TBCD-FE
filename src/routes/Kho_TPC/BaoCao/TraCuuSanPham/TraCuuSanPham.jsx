import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";
import { Link } from "react-router-dom";
import {
  EditableTableRow,
  Table,
  Select,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function TraCuuSanPham({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [page, setPage] = useState(1);
  const [ListUser, setListUser] = useState([]);
  const [user_Id, setUser_Id] = useState("");
  const [DinhMucVatTu, setDinhMucVatTu] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState([]);
  const [loai, setLoai] = useState(true);

  useEffect(() => {
    if (permission && permission.view) {
      getListUser();
      getDinhMucVatTu(keyword, user_Id, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDinhMucVatTu = (keyword, userid, tungay, denngay, page) => {
    let param = convertObjectToUrlParams({
      keyword,
      page,
      userid,
      tungay,
      denngay,
      checkQL: INFO.user_Id,
    });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu?${param}`,
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
          setDinhMucVatTu(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListUser = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_DinhMucVatTu/list-user-lap-dinh-muc`,
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
          if (permission && permission.cof) {
            setListUser(res.data);
          } else {
            res.data.forEach((us) => {
              if (us.nguoiLap_Id === INFO.user_Id) {
                setListUser([us]);
                setUser_Id(us.nguoiLap_Id);
                getDinhMucVatTu(keyword, us.nguoiLap_Id, page);
              }
            });
          }
        } else {
          setListUser([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Thay đổi keyword
   *
   * @param {*} val
   */
  const onChangeKeyword = (val) => {
    setPage(1);
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getDinhMucVatTu(val.target.value, user_Id, page);
    }
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchPhieu = () => {
    getDinhMucVatTu(keyword, user_Id, page);
  };
  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    getDinhMucVatTu(keyword, user_Id, pagination);
  };

  //Lọc các tên giống nhau trong filter
  function removeDuplicates(arr) {
    const uniqueObjects = [];
    arr.forEach((obj) => {
      const isDuplicate = uniqueObjects.some((item) => {
        return item.text === obj.text && item.value === obj.value;
      });
      if (!isDuplicate) {
        uniqueObjects.push(obj);
      }
    });
    return uniqueObjects;
  }
  const { totalRow, pageSize } = data;

  //Lấy thông tin thiết bị
  const dataList = reDataForTable(
    DinhMucVatTu.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );

  const renderDetail = (val) => {
    const detail =
      permission && permission.view ? (
        <Link
          to={{
            pathname: `${match.url}/${val.id}/chi-tiet`,
            state: { itemData: val, permission },
          }}
        >
          {val.maDinhMucVatTu}
        </Link>
      ) : (
        <span disabled>{val.maDinhMucVatTu}</span>
      );
    return <div>{detail}</div>;
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 40,
      align: "center",
    },
    {
      title: "Mã sản phẩm",
      key: "maDinhMucVatTu",
      align: "center",
      render: (val) => renderDetail(val),

      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDinhMucVatTu,
            value: d.maDinhMucVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maDinhMucVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "ngayYeuCau",
      key: "ngayYeuCau",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayYeuCau,
            value: d.ngayYeuCau,
          };
        })
      ),
      onFilter: (value, record) => record.ngayYeuCau.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenNguoiKy",
      key: "tenNguoiKy",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenNguoiKy,
            value: d.tenNguoiKy,
          };
        })
      ),
      onFilter: (value, record) => record.tenNguoiKy.includes(value),
      filterSearch: true,
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Vị trí lưu kho",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Nhập",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Xuất",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
      filterSearch: true,
    },
    {
      title: "Tồn",
      dataIndex: "tennguoiLap",
      key: "tennguoiLap",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tennguoiLap,
            value: d.tennguoiLap,
          };
        })
      ),
      onFilter: (value, record) => record.tennguoiLap.includes(value),
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

  const handleTaoPhieu = () => {
    history.push(`${match.url}/them-moi`);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleTaoPhieu}
          disabled={permission && !permission.add}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectUser_Id = (value) => {
    setUser_Id(value);
    setPage(1);
    getDinhMucVatTu(keyword, value, 1);
  };

  const handleClearUser_Id = () => {
    setUser_Id(null);

    getDinhMucVatTu(keyword, "", 1);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo tra cứu sản phẩm"}
        description="Báo cáo tra cứu sản phẩm"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 10 }}>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <h5>Sản phẩm:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListUser ? ListUser : []}
              placeholder="Chọn sản phẩm"
              optionsvalue={["nguoiLap_Id", "tennguoiLap"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectUser_Id}
              value={user_Id}
              onChange={(value) => setUser_Id(value)}
              allowClear
              onClear={handleClearUser_Id}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          loading={loading}
          pagination={{
            onChange: handleTableChange,
            pageSize: pageSize,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
}

export default TraCuuSanPham;
