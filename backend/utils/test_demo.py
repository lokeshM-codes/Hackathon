import requests
import time

def test_demo():
    print("Resetting demo...")
    res = requests.post("http://localhost:8000/api/reset-demo")
    print("Reset response:", res.json())
    
    print("Triggering demo...")
    res = requests.post("http://localhost:8000/api/trigger-demo")
    print("Trigger response:", res.json())
    
    for i in range(12):
        step = i + 1
        print(f"Advancing to step {step}...")
        res = requests.post(f"http://localhost:8000/api/set-demo-step/{step}")
        time.sleep(1.5)
        res = requests.get("http://localhost:8000/api/analytics")
        data = res.json()
        print(f"Tick {step}: current_demo_step = {data.get('current_demo_step')}, active_alerts = {data.get('active_alerts')}")

if __name__ == "__main__":
    test_demo()
