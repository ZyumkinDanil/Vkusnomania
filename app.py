from flask import Flask, jsonify, request
import psycopg2
from dotenv import load_dotenv
import os

app = Flask(__name__, static_folder='public', static_url_path='')
load_dotenv()

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        return conn
    except Exception as e:
        print(f"Ошибка подключения: {e}")
        raise

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/data')
def get_data():
    try:
        conn = get_db_connection()
        if conn is None:
            raise Exception('Не удалось подключиться к базе данных')
        cur = conn.cursor()
        cur.execute("SELECT id, customer_name AS name FROM orders;")
        columns = [desc[0] for desc in cur.description]
        rows = cur.fetchall()
        data = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        print(f"Ошибка в get_data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/submit_order', methods=['POST'])
def submit_order():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'Нет данных'}), 400
    try:
        conn = get_db_connection()
        if conn is None:
            raise Exception('Не удалось подключиться к базе данных')
        cur = conn.cursor()
        print("Полученные данные:", data)
        cur.execute(
            """
            INSERT INTO orders (customer_name, phone, address, persons, total)
            VALUES (%s, %s, %s, %s, %s) RETURNING id;
            """,
            (data.get('name'), data.get('phone'), data.get('address'), data.get('persons'), data.get('total'))
        )
        order_id_row = cur.fetchone()
        if order_id_row is None:
            raise Exception('Не удалось получить id нового заказа')
        order_id = order_id_row[0]
        items = data.get('items', [])
        for item in items:
            cur.execute(
                """
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (order_id, item.get('id'), item.get('name'), item.get('quantity'), item.get('price'))
            )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Ошибка при сохранении заказа: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/submit_call_order', methods=['POST'])
def submit_call_order():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'Нет данных'}), 400
    try:
        conn = get_db_connection()
        if conn is None:
            raise Exception('Не удалось подключиться к базе данных')
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO call_orders (name, phone)
            VALUES (%s, %s)
            """,
            (data.get('name'), data.get('phone'))
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Ошибка при сохранении заявки на звонок: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)