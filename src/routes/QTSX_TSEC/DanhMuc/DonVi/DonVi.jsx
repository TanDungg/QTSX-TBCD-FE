import { Card } from "antd";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  removeDuplicates,
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import { EditableTableRow, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";

const { EditableRow, EditableCell } = EditableTableRow;

function DonVi({ permission, history }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListData();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `DonVi?page=-1&donviid=${INFO.donVi_Id}`,
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

  let dataList = reDataForTable(Data);
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      stt: "key",
      width: 50,
      align: "center",
    },
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      key: "maDonVi",
      width: 150,
      align: "center",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maDonVi,
            value: d.maDonVi,
          };
        })
      ),
      onFilter: (value, record) => record.maDonVi.includes(value),
      filterSearch: true,
    },
    {
      title: "Tên đơn vị",
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
    {
      title: "Tập đoàn",
      dataIndex: "tenTapDoan",
      key: "tenTapDoan",
      align: "center",
      width: 200,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenTapDoan,
            value: d.tenTapDoan,
          };
        })
      ),
      onFilter: (value, record) => record.tenTapDoan.includes(value),
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

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Danh mục đơn vị"}
        description="Danh sách đơn vị"
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 800, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
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

export default DonVi;
