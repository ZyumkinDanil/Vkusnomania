import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database="vkusnomania",
        user="danil",
        password="postgres"
    )
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    result = cur.fetchone()
    print("Подключение успешно:", result)
    cur.close()
    conn.close()
except Exception as e:
    print("Ошибка подключения:", e)