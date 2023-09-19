import {
  RetweetOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import isEmpty from "lodash/isEmpty";
import { find, map, remove } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";
import { EditableTableRow, Table, ThreeColSearch } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getCookieValue } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;

function DinhMucVatTuForm({ permission, history, match }) {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(({ common }) => common).toJS();
  const [page, setPage] = useState(1);
  const [DonViSelect, setDonViSelect] = useState([]);
  const [DanhMucDinhMucVatTuSelect, setDanhMucDinhMucVatTuSelect] = useState(
    []
  );
  const [DonVi, setDonVi] = useState();
  const [DanhMucDinhMucVatTu, setDanhMucDinhMucVatTu] = useState();
  const [disableDanhMucDinhMucVatTu, setDisableDanhMucDinhMucVatTu] =
    useState(true);
  const [selectedDevice, setSelectedDevice] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      getDonVi();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDonVi = () => {
    const info = getCookieValue("tokenInfo");
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-user-role?id=${info.id}`,
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
        }
      })
      .catch((error) => console.error(error));
  };

  const getDanhMucDinhMucVatTu = (DonViId) => {
    let param = convertObjectToUrlParams({ DonViId, page: -1 });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DanhMucDinhMucVatTu?${param}`,
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
          setDanhMucDinhMucVatTuSelect(res.data);
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
  const getListData = (DonViId, DinhMucVatTuId, page, keyword) => {
    let param = convertObjectToUrlParams({
      DonViId,
      DinhMucVatTuId,
      page,
      keyword,
    });
    dispatch(
      fetchStart(
        `DinhMucVatTu/sl-thiet-bi-DinhMucVatTu?${param}`,
        "GET",
        null,
        "LIST"
      )
    );
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
      getListData(DonVi, DanhMucDinhMucVatTu, 1, val.target.value);
    }
  };

  /**
   * Tìm kiếm người dùng
   *
   */
  const onSearchNguoiDung = () => {
    getListData(DonVi, DanhMucDinhMucVatTu, page, keyword);
  };
  /**
   * handleTableChange
   *
   * Fetch dữ liệu dựa theo thay đổi trang
   * @param {number} pagination
   */
  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(DonVi, DanhMucDinhMucVatTu, pagination);
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
    data.datalist,
    page === 1 ? page : pageSize * (page - 1) + 2
  );
  //tạo bảng
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 40,
      align: "center",
    },
    {
      title: "Loại thiết bị",
      dataIndex: "loaiThietBi",
      key: "loaiThietBi",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.loaiThietBi,
            value: d.loaiThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.loaiThietBi.includes(value),
      filterSearch: true,
    },
    {
      title: "Mã thiết bị",
      dataIndex: "maThietBi",
      key: "maThietBi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maThietBi,
            value: d.maThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.maThietBi.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "tenThietBi",
      key: "tenThietBi",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenThietBi,
            value: d.tenThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.tenThietBi.includes(value),
      filterSearch: true,
    },
    {
      title: "Số lượng thiết bị",
      dataIndex: "soLuong",
      key: "soLuong",
      align: "center",
      sorter: (a, b) => a.soLuong - b.soLuong,
    },
    {
      title: "Số seri",
      dataIndex: "soSeri",
      key: "soSeri",
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.soSeri,
            value: d.soSeri,
          };
        })
      ),
      onFilter: (value, record) => record.soSeri.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "donViTinh",
      key: "donViTinh",
      align: "center",
    },
    {
      title: "Người quản lý",
      dataIndex: "nguoiQuanLy",
      key: "nguoiQuanLy",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.nguoiQuanLy,
            value: d.nguoiQuanLy,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiQuanLy.includes(value),
      filterSearch: true,
    },
    {
      title: "Tình trạng thiết bị",
      dataIndex: "tenTinhTrangThietBi",
      key: "tenTinhTrangThietBi",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tinhTrangThietBi,
            value: d.tinhTrangThietBi,
          };
        })
      ),
      onFilter: (value, record) => record.tinhTrangThietBi.includes(value),
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

  /**
   * Redirect to create new organization
   *
   * @memberof ChucNang
   */
  const handleDieuChuyen = () => {
    history.push({
      pathname:
        selectedDevice.length > 0
          ? `/quan-ly-thiet-bi/dieu-chuyen-thiet-bi/them-moi`
          : `/quan-ly-thiet-bi/dieu-chuyen-thiet-bi`,
      state: {
        ThietBi: selectedDevice,
        DinhMucVatTu: DanhMucDinhMucVatTu,
        DonVi: DonVi,
      },
    });
  };
  const handleThanhLy = () => {
    history.push({
      pathname:
        selectedDevice.length > 0
          ? `/quan-ly-thiet-bi/thanh-ly-thiet-bi/them-moi`
          : `/quan-ly-thiet-bi/thanh-ly-thiet-bi`,
      state: {
        ThietBi: selectedDevice,
        DinhMucVatTu: DanhMucDinhMucVatTu,
        DonVi: DonVi,
      },
    });
  };
  const handleBanGiao = () => {
    history.push({
      pathname:
        selectedDevice.length > 0
          ? `/quan-ly-thiet-bi/ban-giao-thiet-bi/them-moi`
          : `/quan-ly-thiet-bi/ban-giao-thiet-bi`,
      state: {
        ThietBi: selectedDevice,
        DinhMucVatTu: DanhMucDinhMucVatTu,
        DonVi: DonVi,
      },
    });
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<SolutionOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleBanGiao}
          disabled={permission && !permission.add}
        >
          Bàn giao
        </Button>
        <Button
          icon={<RetweetOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleDieuChuyen}
          disabled={permission && !permission.add}
        >
          Điều chuyển
        </Button>
        <Button
          icon={<ShoppingCartOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleThanhLy}
          disabled={permission && !permission.add}
        >
          Thanh lý
        </Button>
      </>
    );
  };

  const handleOnSelectDonVi = (value) => {
    setDisableDanhMucDinhMucVatTu(false);
    setDonVi(value);
    setDanhMucDinhMucVatTu(null);
    getDanhMucDinhMucVatTu(value);
    getListData(value, null, page);
  };

  const handleOnSelectDinhMucVatTu = (value) => {
    setDanhMucDinhMucVatTu(value);
    getListData(DonVi, value, page);
  };

  const handleClearDonVi = () => {
    setDonVi(null);
    setDisableDanhMucDinhMucVatTu(true);
    setDanhMucDinhMucVatTu(null);
    getListData(null, null, page);
    setSelectedDevice([]);
    setSelectedKeys([]);
  };

  const handleClearDinhMucVatTu = () => {
    setDanhMucDinhMucVatTu(null);
    getListData(DonVi, null, 1);
    setSelectedDevice([]);
    setSelectedKeys([]);
  };

  function hanldeRemoveSelected(device) {
    const newDevice = remove(selectedDevice, (d) => {
      return d.key !== device.key;
    });
    const newKeys = remove(selectedKeys, (d) => {
      return d !== device.key;
    });
    setSelectedDevice(newDevice);
    setSelectedKeys(newKeys);
  }
  const rowSelection = {
    selectedRowKeys: selectedKeys,
    selectedRows: selectedDevice,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedDevice = [...selectedRows];
      const newSelectedKey = [...selectedRowKeys];
      setSelectedDevice(newSelectedDevice);
      setSelectedKeys(newSelectedKey);
    },
  };
  const propSelect1 = {
    data: DonViSelect ? DonViSelect : [],
    placeholder: "Chọn đơn vị",
    optionsvalue: ["donVi_Id", "tenDonVi"],
    style: { width: "100%" },
    showSearch: true,
    optionFilterProp: "name",
    onSelect: handleOnSelectDonVi,
    value: DonVi,
    onChange: (value) => setDonVi(value),
    allowClear: true,
    onClear: handleClearDonVi,
  };
  const propSelect2 = {
    data: DanhMucDinhMucVatTuSelect ? DanhMucDinhMucVatTuSelect : [],
    placeholder: "Danh mục DinhMucVatTu",
    optionsvalue: ["id", "tenDinhMucVatTu"],
    style: { width: "100%" },
    showSearch: true,
    optionFilterProp: "name",
    onSelect: handleOnSelectDinhMucVatTu,
    disabled: disableDanhMucDinhMucVatTu,
    value: DanhMucDinhMucVatTu,
    onChange: (value) => setDanhMucDinhMucVatTu(value),
    allowClear: true,
    onClear: handleClearDinhMucVatTu,
  };
  const propSearch = {
    loading,
    value: keyword,
    onChange: onChangeKeyword,
    onPressEnter: onSearchNguoiDung,
    onSearch: onSearchNguoiDung,
    allowClear: true,
    placeholder: "Tìm kiếm",
  };
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"DinhMucVatTu"}
        description="Danh sách thiết bị trong DinhMucVatTu"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        {/* <Row>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            Đơn vị:
          </Col>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <Select
              className="heading-select slt-search th-select-heading"
              data={DonViSelect ? DonViSelect : []}
              placeholder="Chọn đơn vị"
              optionsvalue={["donVi_Id", "tenDonVi"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDonVi}
              value={DonVi}
              onChange={(value) => setDonVi(value)}
              allowClear
              onClear={handleClearDonVi}
            />
          </Col>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            DinhMucVatTu:
          </Col>
          <Col xl={6} lg={8} md={8} sm={19} xs={17} style={{ marginBottom: 8 }}>
            <Select
              className="heading-select slt-search th-select-heading"
              data={DanhMucDinhMucVatTuSelect ? DanhMucDinhMucVatTuSelect : []}
              placeholder="Danh mục DinhMucVatTu"
              optionsvalue={["id", "tenDinhMucVatTu"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDinhMucVatTu}
              disabled={disableDanhMucDinhMucVatTu}
              value={DanhMucDinhMucVatTu}
              onChange={(value) => setDanhMucDinhMucVatTu(value)}
              allowClear
              onClear={handleClearDinhMucVatTu}
            />
          </Col>
          <Col xl={6} lg={24} md={24} xs={24}>
            <Toolbar
              count={1}
              search={{
                loading,
                value: keyword,
                onChange: onChangeKeyword,
                onPressEnter: onSearchNguoiDung,
                onSearch: onSearchNguoiDung,
                allowClear: true,
                placeholder: "Tìm kiếm",
              }}
            />
          </Col>
        </Row> */}
        <ThreeColSearch
          title={["Đơn vị", "DinhMucVatTu"]}
          select1={propSelect1}
          select2={propSelect2}
          search={propSearch}
        />
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedKeys,
            getCheckboxProps: (record) => ({
              disabled:
                DonVi === null ||
                DanhMucDinhMucVatTu === null ||
                DanhMucDinhMucVatTu === undefined,
            }),
          }}
          onRow={(record, rowIndex) =>
            DonVi === null ||
            DanhMucDinhMucVatTu === null ||
            DanhMucDinhMucVatTu === undefined
              ? {}
              : {
                  onClick: (e) => {
                    const found = find(selectedKeys, (k) => k === record.key);
                    if (found === undefined) {
                      setSelectedDevice([...selectedDevice, record]);
                      setSelectedKeys([...selectedKeys, record.key]);
                    } else {
                      hanldeRemoveSelected(record);
                    }
                  },
                }
          }
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

export default DinhMucVatTuForm;
