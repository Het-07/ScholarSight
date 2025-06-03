resource "aws_cloudwatch_log_group" "scholarsight_logs" {
  name              = "/scholarsight/docker-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_metric_alarm" "ec2_cpu_alarm" {
  alarm_name          = "scholarsight-ec2-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alarm when EC2 CPU exceeds 80%"
  dimensions = {
    InstanceId = aws_instance.app_model.id
  }
}