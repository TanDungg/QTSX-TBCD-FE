import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Modal as AntModal, Row } from "antd";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeDuplicates, reDataForTable, getDateNow } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
  Toolbar,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams } from "src/util/Common";
import { BASE_URL_API } from "src/constants/Config";
import numeral from "numeral";
import moment from "moment";

const { EditableRow, EditableCell } = EditableTableRow;

function HocPhi({ permission, history, match }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const [Data, setData] = useState([]);
  const [ListDonViDaoTao, setListDonViDaoTao] = useState([]);
  const [DonViDaoTao, setDonViDaoTao] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [DataChiTiet, setDataChiTiet] = useState([]);
  const [DisabledModal, setDisabledModal] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListDonViDaoTao();
      getListData(DonViDaoTao, keyword, page);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (vptq_lms_DonViDaoTao_Id, keyword, page) => {
    let param = convertObjectToUrlParams({
      vptq_lms_DonViDaoTao_Id,
      keyword,
      page,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocPhi?${param}`,
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

  const handleTableChange = (pagination) => {
    setPage(pagination);
    getListData(DonViDaoTao, keyword, pagination);
  };

  const onSearchHocPhi = () => {
    getListData(DonViDaoTao, keyword, page);
  };

  const onChangeKeyword = (val) => {
    setKeyword(val.target.value);
    if (isEmpty(val.target.value)) {
      getListData(DonViDaoTao, val.target.value, page);
    }
  };

  const handleChiTiet = (item) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocPhi/${item.id}`,
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
        setDataChiTiet(res.data.list_ChiTiets);
      } else {
        setDataChiTiet([]);
      }
    });
    setDisabledModal(true);
  };

  const deleteItemFunc = (item) => {
    const title = "học phí đào tạo";
    ModalDeleteConfirm(deleteItemAction, item, item.tenHocPhi, title);
  };

  const deleteItemAction = (item) => {
    let url = `vptq_lms_HocPhi/${item.id}`;
    new Promise((resolve, reject) => {
      dispatch(fetchStart(url, "DELETE", null, "DELETE", "", resolve, reject));
    })
      .then((res) => {
        getListData(DonViDaoTao, keyword, page);
      })
      .catch((error) => console.error(error));
  };
  const actionContent = (item) => {
    const detailItem =
      permission && permission.del && !item.isUsed
        ? { onClick: () => handleChiTiet(item) }
        : { disabled: true };

    const editItem =
      permission &&
      permission.edit &&
      moment(item.ngayApDung, "DD/MM/YYYY") >
        moment(getDateNow(), "DD/MM/YYYY") ? (
        <Link
          to={{
            pathname: `${match.url}/${item.id}/chinh-sua`,
            state: { itemData: item, permission },
          }}
          title="Chỉnh sửa học phí"
        >
          <EditOutlined />
        </Link>
      ) : (
        <span disabled title="Chỉnh sửa học phí">
          <EditOutlined />
        </span>
      );

    const deleteItemVal =
      permission &&
      permission.del &&
      moment(item.ngayApDung, "DD/MM/YYYY") > moment(getDateNow(), "DD/MM/YYYY")
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
    return (
      <div>
        <React.Fragment>
          <a {...detailItem} title="Xem danh sách chi tiết">
            <SearchOutlined />
          </a>
          <Divider type="vertical" />
          {editItem}
          <Divider type="vertical" />
          <a {...deleteItemVal} title="Xóa học phí">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const { totalRow } = Data;
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
      title: "Lần ban hành",
      dataIndex: "lanBanHanh",
      key: "lanBanHanh",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.lanBanHanh,
            value: d.lanBanHanh,
          };
        })
      ),
      onFilter: (value, record) => record.lanBanHanh.toString().includes(value),
      filterSearch: true,
    },
    {
      title: "Tên học phí",
      dataIndex: "tenHocPhi",
      key: "tenHocPhi",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenHocPhi,
            value: d.tenHocPhi,
          };
        })
      ),
      onFilter: (value, record) => record.tenHocPhi.includes(value),
      filterSearch: true,
    },
    {
      title: "Đơn vị đào tạo",
      dataIndex: "tenDonViDaoTao",
      key: "tenDonViDaoTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenDonViDaoTao,
            value: d.tenDonViDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenDonViDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày áp dụng",
      dataIndex: "ngayApDung",
      key: "ngayApDung",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.ngayApDung,
            value: d.ngayApDung,
          };
        })
      ),
      onFilter: (value, record) => record.ngayApDung.includes(value),
      filterSearch: true,
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "left",
      width: 200,
      render: (value) => {
        return (
          value && (
            <span>
              <a
                target="_blank"
                href={BASE_URL_API + value}
                rel="noopener noreferrer"
              >
                {value.split("/")[5]}
              </a>
            </span>
          )
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
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

  let colChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Tên chuyên đề",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 250,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "center",
      width: 200,
    },
    {
      title: (
        <div>
          Học phí <br />
          (VNĐ/học viên)
        </div>
      ),
      dataIndex: "hocPhi",
      key: "hocPhi",
      align: "center",
      width: 150,
      render: (value) => {
        return <span>{numeral(value).format("0,0 VNĐ")} (VNĐ)</span>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "left",
      width: 150,
    },
  ];

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

  const handleOnSelectDonViDaoTao = (value) => {
    setDonViDaoTao(value);
    getListData(value, keyword, page);
  };

  const handleClearDonViDaoTao = () => {
    setDonViDaoTao(null);
    getListData(null, keyword, page);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Học phí đào tạo"}
        description="Danh sách học phí đào tạo"
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
            style={{ marginBottom: 8 }}
          >
            <span>Đơn vị:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListDonViDaoTao ? ListDonViDaoTao : []}
              placeholder="Chọn đơn vị đào tạo"
              optionsvalue={["id", "tenDonViDaoTao"]}
              style={{ width: "100%" }}
              value={DonViDaoTao}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectDonViDaoTao}
              allowClear
              onClear={handleClearDonViDaoTao}
            />
          </Col>
          <Col
            xxl={5}
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
                onPressEnter: onSearchHocPhi,
                onSearch: onSearchHocPhi,
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
          scroll={{ x: 1200, y: "50vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            onChange: handleTableChange,
            pageSize: 20,
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
      <AntModal
        title={"Danh sách học phí theo chuyên đề"}
        className="th-card-reset-margin"
        open={DisabledModal}
        width={width > 1200 ? `80%` : "100%"}
        closable={true}
        onCancel={() => setDisabledModal(false)}
        footer={null}
      >
        <Table
          bordered
          columns={colChiTiet}
          components={components}
          scroll={{ x: 1000, y: "50vh" }}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(DataChiTiet)}
          size="small"
          loading={loading}
          pagination={false}
        />
      </AntModal>
    </div>
  );
}

export default HocPhi;
