import { useEffect, useState } from "react";


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: заменить URL на ваш API endpoint
    // axios
    //   .get("/orders")
    //   .then((res) => {
    //     setOrders(res.data);
    //     setLoading(false);
    //   })
    //   .catch((err) => {
    //     setError("Ошибка при загрузке заказов");
    //     setLoading(false);
    //   });
  }, []);

  if (loading) {
    return <p className="text-center mt-5">Загрузка заказов...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-5">{error}</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 brand-green">Мои заказы</h2>
      {orders.length === 0 ? (
        <p>У вас нет заказов.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Название</th>
                <th>Дата создания</th>
                <th>Статус</th>
                <th>Сумма</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.name}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.status}</td>
                  <td>{order.amount} ₽</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-success me-2">
                      Pay
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
