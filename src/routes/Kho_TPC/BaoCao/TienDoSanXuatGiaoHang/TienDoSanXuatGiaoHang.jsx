import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Col, DatePicker, Divider } from "antd";
import { map, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  exportExcel,
  getDateNow,
  getNamNow,
  getThangNow,
  reDataForTable,
} from "src/util/Common";
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
import moment from "moment";

const { RangePicker } = DatePicker;
const { EditableRow, EditableCell } = EditableTableRow;

function TienDoSanXuatGiaoHang({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [Data, setData] = useState([]);
  const [DataXuat, setDataXuat] = useState([]);
  const [ListLoaiKeHoach, setListLoaiKeHoach] = useState([]);
  const [LoaiKeHoach, setLoaiKeHoach] = useState(null);
  const [TenKeHoach, setTenKeHoach] = useState(null);
  const [ListXuong, setListXuong] = useState([]);
  const [Xuong, setXuong] = useState(null);
  const [keyword, setKeyword] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (permission && permission.view) {
      getLoaiKeHoach();
      getXuong();
      getListData(LoaiKeHoach, Xuong, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(LoaiKeHoach);

  const getListData = (LoaiKeHoach_Id, phongBan_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      LoaiKeHoach_Id,
      phongBan_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-tien-do-sx-gh?${param}`,
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
          setData(res.data);
        }
      })
      .catch((error) => console.error(error));
    let params = convertObjectToUrlParams({
      LoaiKeHoach_Id,
      phongBan_Id,
      keyword,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_BaoCao/bao-cao-tien-do-sx-gh?${params}`,
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
          setDataXuat(res.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const getLoaiKeHoach = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_LoaiKeHoach?page=-1`,
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
          setListLoaiKeHoach(res.data);
          setLoaiKeHoach(res.data[0].id);
        } else {
          setListLoaiKeHoach([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getXuong = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhongBan?page=-1&&donviid=${INFO.donVi_Id}`,
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
          const xuong = [];
          res.data.forEach((x) => {
            if (x.tenPhongBan.toLowerCase().includes("xưởng")) {
              xuong.push(x);
            }
          });
          setListXuong(xuong);
          setXuong(xuong[0].id);
        } else {
          setListXuong([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const onChangeKeyword = (val) => {
    setPage(1);
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(LoaiKeHoach, Xuong, val.target.value, page);
    }
  };

  const onSearchKeyword = () => {
    getListData(LoaiKeHoach, Xuong, keyword, page);
  };

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(LoaiKeHoach, Xuong, keyword, pagination);
  };

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
  const { totalRow, pageSize } = Data;

  const dataList = reDataForTable(
    Data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maVatTu,
            value: d.maVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.maVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
      width: 250,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenVatTu,
            value: d.tenVatTu,
          };
        })
      ),
      onFilter: (value, record) => record.tenVatTu.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViTinh,
            value: d.tenDonViTinh,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViTinh.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng nhập",
      dataIndex: "soLuongNhap",
      key: "soLuongNhap",
      align: "center",
      width: 150,
    },
    {
      title: "Số lượng xuất",
      dataIndex: "soLuongXuat",
      key: "soLuongXuat",
      align: "center",
      width: 150,
    },
    {
      title: "Tồn đầu kỳ",
      dataIndex: "tonDauKy",
      key: "tonDauKy",
      align: "center",
      width: 150,
    },
    {
      title: "Tồn cuối kỳ",
      dataIndex: "tonCuoiKy",
      key: "tonCuoiKy",
      align: "center",
      width: 150,
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

  const XuatExcel = () => {
    // const newData = {
    //   ctPhieuTonKho: DataXuat,
    // };
    // new Promise((resolve, reject) => {
    //   dispatch(
    //     fetchStart(
    //       `lkn_BaoCao/export-file-excel-ton-kho`,
    //       "POST",
    //       newData,
    //       "",
    //       "",
    //       resolve,
    //       reject
    //     )
    //   );
    // }).then((res) => {
    //   exportExcel(
    //     `BaoCao${
    //       TenKeHoach === "Kế hoạch sản xuất"
    //         ? "KeHoachSanXuat"
    //         : "KeHoachGiaoHang"
    //     }`,
    //     res.data.dataexcel
    //   );
    // });
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<DownloadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={XuatExcel}
          disabled={(permission && !permission.add) || DataXuat.length === 0}
        >
          Xuất excel
        </Button>
      </>
    );
  };

  const handleOnSelectLoaiKeHoach = (value) => {
    setLoaiKeHoach(value);
    const newData = ListLoaiKeHoach.filter((data) => data.id === value);
    setTenKeHoach(newData[0].tenLoaiKeHoach);
    getListData(value, Xuong, keyword, page);
  };

  const handleOnSelectXuong = (value) => {
    setXuong(value);
    getListData(LoaiKeHoach, value, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Báo cáo tiến độ sản xuất - giao hàng"}
        description="Báo cáo tiến độ sản xuất - giao hàng"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row style={{ marginBottom: 10 }}>
          <Col
            xxl={6}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Loại kế hoạch:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListLoaiKeHoach ? ListLoaiKeHoach : []}
              placeholder="Chọn loại kế hoạch"
              optionsvalue={["id", "tenLoaiKeHoach"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectLoaiKeHoach}
              value={LoaiKeHoach}
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
            <h5>Xưởng:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenPhongBan"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
              onSelect={handleOnSelectXuong}
              value={Xuong}
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
            <h5>Tìm kiếm:</h5>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchKeyword,
                onSearch: onSearchKeyword,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row>
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1200, y: "55vh" }}
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

export default TienDoSanXuatGiaoHang;
